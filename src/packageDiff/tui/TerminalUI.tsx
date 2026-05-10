import React, { memo, useEffect, useMemo, useRef, useState } from 'react'
import { Box, Text, useInput } from 'ink'
import { useMetricsStore } from '../../components/App.js'
import { VirtualSelectableList } from '../../components/VirtualSelectableList.js'
import { useTerminalSize } from '../../hooks/useTerminalSize.js'
import { ReleaseNotesCollection } from '../data/releaseNotesCollection.js'
import { SemverChange } from '../enums/semver.js'
import { ChangeStatus } from '../enums/changeStatus.js'
import { PackageManagerType } from '../analyzers/packageManagerType.js'
import type { QueryEngine } from '../../QueryEngine.js'
import { getPackageListOffset } from './packageListRange.js'

export interface TuiPackageChange {
  name: string
  type: PackageManagerType
  from: string | null
  to: string | null
  status: ChangeStatus
  releases: number | null
  semver: SemverChange | null
  filename: string
}

interface TerminalUIProps {
  packages: TuiPackageChange[]
  queryEngine: QueryEngine
  includePrerelease?: boolean
  onExit?: () => void
}

type ReleaseNotesStatus = 'idle' | 'loading' | 'ready' | 'empty' | 'error'

interface ReleaseNotesState {
  status: ReleaseNotesStatus
  notes: ReleaseNotesCollection | null
  message?: string
}

const THEME = {
  bg: 'black',
  fg: 'white',
  muted: 'gray',
  accent: 'cyanBright',
  divider: 'gray',
  selectedBg: 'white',
  selectedFg: 'black',
  major: 'red',
  minor: 'yellow',
  patch: 'green',
  added: 'green',
  removed: 'red',
  updated: 'cyan',
  downgraded: 'yellow',
  changes: 'green',
  fixes: 'blue',
  breaking: 'red',
  deprecated: 'yellow',
  security: 'magenta',
  removedSection: 'red',
}

export function TerminalUI({
  packages,
  queryEngine,
  includePrerelease = false,
  onExit,
}: TerminalUIProps) {
  const metrics = useMetricsStore()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [mode, setMode] = useState<'summary' | 'full'>('summary')
  const [viewMode, setViewMode] = useState<'summary' | 'details'>('summary')
  const [detailsScroll, setDetailsScroll] = useState(0)
  const [releaseNotes, setReleaseNotes] = useState<ReleaseNotesState>({
    status: 'idle',
    notes: null,
  })
  const requestId = useRef(0)
  const releaseNotesCache = useRef(new Map<string, ReleaseNotesCollection | null>())
  const terminal = useTerminalSize()

  useInput((input, key) => {
    if (input === 'q') {
      onExit?.()
      return
    }

    if (viewMode === 'details') {
      if (key.escape || key.backspace) {
        setViewMode('summary')
        return
      }
      if (key.return) {
        setViewMode('summary')
        return
      }
      if (key.upArrow || input === 'k') {
        setDetailsScroll((prev) => Math.max(0, prev - 1))
      }
      if (key.downArrow || input === 'j') {
        setDetailsScroll((prev) => prev + 1)
      }
      if (key.pageUp) {
        setDetailsScroll((prev) => Math.max(0, prev - 10))
      }
      if (key.pageDown) {
        setDetailsScroll((prev) => prev + 10)
      }
      if (input === 'g') {
        setDetailsScroll(0)
      }
      if (input === 'G') {
        setDetailsScroll(Number.MAX_SAFE_INTEGER)
      }
      return
    }

    if (key.upArrow || input === 'k') {
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev))
    }
    if (key.downArrow || input === 'j') {
      setSelectedIndex((prev) => (prev < packages.length - 1 ? prev + 1 : prev))
    }
    if (key.pageUp) {
      setSelectedIndex((prev) => Math.max(0, prev - 10))
    }
    if (key.pageDown) {
      setSelectedIndex((prev) => Math.min(packages.length - 1, prev + 10))
    }
    if (input === 'g') {
      setSelectedIndex(0)
    }
    if (input === 'G') {
      setSelectedIndex(packages.length - 1)
    }
    if (input === 't') {
      setMode((prev) => (prev === 'summary' ? 'full' : 'summary'))
    }
    if (key.return) {
      setViewMode('details')
      setDetailsScroll(0)
    }
    if (key.escape) {
      onExit?.()
    }
  })

  const selected = packages[selectedIndex]
  const statusColor = useMemo(() => getStatusColor(selected?.status), [selected?.status])
  const selectedKey = useMemo(
    () =>
      selected
        ? `${selected.type}:${selected.name}:${selected.from ?? ''}:${selected.to ?? ''}`
        : '',
    [selected],
  )

  useEffect(() => {
    metrics.reportSelectionChange()
  }, [metrics, selectedKey])

  useEffect(() => {
    if (!selected) {
      setReleaseNotes({ status: 'empty', notes: null, message: 'No package selected' })
      return
    }

    if (!selected.from || !selected.to) {
      setReleaseNotes({
        status: 'empty',
        notes: null,
        message: 'Release notes unavailable for added/removed packages',
      })
      return
    }

    const cached = releaseNotesCache.current.get(selectedKey)
    if (cached !== undefined) {
      if (cached === null) {
        setReleaseNotes({ status: 'empty', notes: null, message: 'No release notes found' })
      } else {
        setReleaseNotes({ status: 'ready', notes: cached })
      }
      return
    }

    setReleaseNotes((current) => ({
      ...current,
      status: 'loading',
      message: 'Fetching release notes...',
    }))
    metrics.reportReleaseNotesLoad('loading')
    const currentRequest = ++requestId.current

    const timeout = setTimeout(() => {
      void (async () => {
        try {
          const notes = await queryEngine.loadReleaseNotes(selected, includePrerelease)

          if (currentRequest !== requestId.current) {
            return
          }

          releaseNotesCache.current.set(selectedKey, notes)
          if (!notes || notes.isEmpty()) {
            metrics.reportReleaseNotesLoad('empty')
            setReleaseNotes({ status: 'empty', notes: null, message: 'No release notes found' })
          } else {
            metrics.reportReleaseNotesLoad('ready')
            setReleaseNotes({ status: 'ready', notes })
          }
        } catch (error) {
          if (currentRequest !== requestId.current) {
            return
          }
          const message = error instanceof Error ? error.message : 'Failed to load release notes'
          metrics.reportReleaseNotesLoad('error')
          setReleaseNotes({ status: 'error', notes: null, message })
        }
      })()
    }, 120)

    return () => {
      clearTimeout(timeout)
    }
  }, [selected, selectedKey, queryEngine, includePrerelease, metrics])

  const rows = terminal.rows
  const columns = terminal.columns
  const headerLines = 3
  const footerLines = 3
  const bodyHeight = Math.max(8, rows - headerLines - footerLines)
  const listWidth = Math.min(42, Math.max(28, Math.floor(columns * 0.35)))
  const detailsWidth = Math.max(40, columns - listWidth - 3)
  const divider = createVerticalDivider(bodyHeight)
  const detailsHeaderLines = viewMode === 'details' ? 3 : 4
  const detailsContentHeight = Math.max(4, bodyHeight - detailsHeaderLines - 1)
  const detailsLines = useMemo(
    () => buildDetailsLines(releaseNotes, selected, detailsWidth - 3),
    [releaseNotes, selected, detailsWidth],
  )
  const maxDetailsScroll = Math.max(0, detailsLines.length - detailsContentHeight)
  const detailsScrollOffset = Math.min(detailsScroll, maxDetailsScroll)
  const visibleDetailsLines = detailsLines.slice(
    detailsScrollOffset,
    detailsScrollOffset + detailsContentHeight,
  )

  useEffect(() => {
    if (detailsScroll > maxDetailsScroll) {
      setDetailsScroll(maxDetailsScroll)
    }
  }, [detailsScroll, maxDetailsScroll])

  useEffect(() => {
    metrics.reportRender('chrome', 1, 'terminal-frame')
  }, [metrics, viewMode, mode, releaseNotes.status, detailsScrollOffset])

  return (
    <Box flexDirection="column">
      <TerminalHeader />
      <Text color={THEME.divider}>{'-'.repeat(Math.max(0, columns - 2))}</Text>

      <Box flexDirection="row">
        <PackageListPane
          packages={packages}
          selectedIndex={selectedIndex}
          bodyHeight={bodyHeight}
          listWidth={listWidth}
        />

        <Text color={THEME.divider}>{divider}</Text>

        <DetailsPane
          selected={selected}
          statusColor={statusColor}
          releaseNotes={releaseNotes}
          mode={mode}
          viewMode={viewMode}
          detailsWidth={detailsWidth}
          bodyHeight={bodyHeight}
          visibleDetailsLines={visibleDetailsLines}
          detailsScrollOffset={detailsScrollOffset}
          maxDetailsScroll={maxDetailsScroll}
        />
      </Box>

      <Text color={THEME.divider}>{'-'.repeat(Math.max(0, columns - 2))}</Text>

      <TerminalFooter
        selected={selected}
        viewMode={viewMode}
        mode={mode}
      />
    </Box>
  )
}

const TerminalHeader = memo(function TerminalHeader() {
  const metrics = useMetricsStore()

  useEffect(() => {
    metrics.reportRender('chrome', 1, 'header')
  }, [])

  return (
    <>
      <Box flexDirection="row" justifyContent="space-between" paddingX={1}>
        <Text color={THEME.accent}>package-diff</Text>
        <Text color={THEME.muted}>Dependency diff viewer</Text>
      </Box>
      <Box flexDirection="row" paddingX={1}>
        <Text color={THEME.muted}>Dependency changes browser</Text>
      </Box>
    </>
  )
})

const PackageListPane = memo(function PackageListPane({
  packages,
  selectedIndex,
  bodyHeight,
  listWidth,
}: {
  packages: TuiPackageChange[]
  selectedIndex: number
  bodyHeight: number
  listWidth: number
}) {
  const metrics = useMetricsStore()
  const offset = getPackageListOffset(packages.length, selectedIndex, bodyHeight)
  useEffect(() => {
    metrics.reportRender('list', 1, 'list')
  }, [metrics, offset, bodyHeight])

  return (
    <Box flexDirection="column" width={listWidth} paddingLeft={1} paddingRight={1}>
      <VirtualSelectableList
        items={packages}
        offset={offset}
        viewportSize={bodyHeight}
        renderItem={(pkg, absoluteIndex) => {
          const isSelected = absoluteIndex === selectedIndex
          const line = truncate(pkg.name, listWidth - 4)
          const textProps = isSelected
            ? { color: THEME.selectedFg as string, backgroundColor: THEME.selectedBg as string }
            : { color: THEME.fg as string }

          return (
            <Text key={`${pkg.name}-${absoluteIndex}`} {...textProps}>
              {isSelected ? '>' : ' '} {line}
            </Text>
          )
        }}
      />
    </Box>
  )
})

const DetailsPane = memo(function DetailsPane({
  selected,
  statusColor,
  releaseNotes,
  mode,
  viewMode,
  detailsWidth,
  bodyHeight,
  visibleDetailsLines,
  detailsScrollOffset,
  maxDetailsScroll,
}: {
  selected: TuiPackageChange | undefined
  statusColor: string
  releaseNotes: ReleaseNotesState
  mode: 'summary' | 'full'
  viewMode: 'summary' | 'details'
  detailsWidth: number
  bodyHeight: number
  visibleDetailsLines: string[]
  detailsScrollOffset: number
  maxDetailsScroll: number
}) {
  const metrics = useMetricsStore()

  useEffect(() => {
    metrics.reportRender('details', selected ? 2 : 1, 'details')
  }, [metrics, selected?.name, releaseNotes.status, viewMode, mode, detailsScrollOffset])

  return (
    <Box flexDirection="column" width={detailsWidth} paddingLeft={2} paddingRight={1}>
      {selected ? (
        <DetailsPanel
          selected={selected}
          statusColor={statusColor}
          releaseNotes={releaseNotes}
          mode={mode}
          viewMode={viewMode}
          maxWidth={detailsWidth - 3}
          maxHeight={bodyHeight}
          visibleLines={visibleDetailsLines}
          scrollOffset={detailsScrollOffset}
          maxScroll={maxDetailsScroll}
        />
      ) : (
        <Text color={THEME.muted}>No selection</Text>
      )}
    </Box>
  )
})

const TerminalFooter = memo(function TerminalFooter({
  selected,
  viewMode,
  mode,
}: {
  selected: TuiPackageChange | undefined
  viewMode: 'summary' | 'details'
  mode: 'summary' | 'full'
}) {
  const metrics = useMetricsStore()

  useEffect(() => {
    metrics.reportRender('chrome', 1, 'footer')
  }, [viewMode, mode, selected?.name])

  return (
    <>
      <Box flexDirection="row" justifyContent="space-between" paddingX={1}>
        <Box>
          {renderSemverTag(selected)}
          <Text> {selected?.name ?? ''}</Text>
        </Box>
        <Text color={THEME.muted}>{formatRange(selected)}</Text>
        <Text color={THEME.muted}>
          View: {viewMode === 'summary' ? 'Summary' : 'Details'} · Mode:{' '}
          {mode === 'summary' ? 'Summary' : 'Full'}
        </Text>
      </Box>

      <Box flexDirection="row" paddingX={1}>
        <Text color={THEME.muted}>
          {viewMode === 'details'
            ? 'Up/Down Scroll   j/k Scroll   Enter/Esc Back   g/G Jump   q Quit'
            : 'Up/Down Navigate   j/k Move   Enter Details   t Toggle mode   g/G Jump   q Quit'}
        </Text>
      </Box>
    </>
  )
})

function renderSemverTag(selected: TuiPackageChange | undefined) {
  if (!selected) {
    return <Text> </Text>
  }
  const tag = getSemverLabel(selected)
  const color = getSemverColor(selected)
  return (
    <Text backgroundColor={color} color={THEME.selectedFg}>
      {' '}
      {tag}{' '}
    </Text>
  )
}

function getSemverLabel(selected: TuiPackageChange): string {
  if (selected.semver) {
    return selected.semver.toUpperCase()
  }
  switch (selected.status) {
    case ChangeStatus.Added:
      return 'ADD'
    case ChangeStatus.Removed:
      return 'REM'
    case ChangeStatus.Downgraded:
      return 'DOWN'
    case ChangeStatus.Updated:
      return 'UPD'
    default:
      return 'CHG'
  }
}

function getSemverColor(selected: TuiPackageChange): string {
  if (selected.semver === SemverChange.Major) return THEME.major
  if (selected.semver === SemverChange.Minor) return THEME.minor
  if (selected.semver === SemverChange.Patch) return THEME.patch
  switch (selected.status) {
    case ChangeStatus.Added:
      return THEME.added
    case ChangeStatus.Removed:
      return THEME.removed
    case ChangeStatus.Downgraded:
      return THEME.downgraded
    case ChangeStatus.Updated:
      return THEME.updated
    default:
      return THEME.muted
  }
}

function getStatusColor(status: ChangeStatus | undefined): string {
  if (!status) return THEME.fg
  switch (status) {
    case ChangeStatus.Added:
      return THEME.added
    case ChangeStatus.Removed:
      return THEME.removed
    case ChangeStatus.Updated:
      return THEME.updated
    case ChangeStatus.Downgraded:
      return THEME.downgraded
    default:
      return THEME.fg
  }
}

function formatRange(selected: TuiPackageChange | undefined): string {
  if (!selected) return ''
  if (selected.from && selected.to) {
    return `${selected.from} → ${selected.to}`
  }
  return selected.to ?? selected.from ?? ''
}

function createVerticalDivider(height: number): string {
  if (height <= 0) return ''
  return Array.from({ length: height }, () => '|').join('\n')
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  if (maxLength <= 3) return text.slice(0, maxLength)
  return `${text.slice(0, maxLength - 3)}...`
}

interface DetailsPanelProps {
  selected: TuiPackageChange
  statusColor: string
  releaseNotes: ReleaseNotesState
  mode: 'summary' | 'full'
  viewMode: 'summary' | 'details'
  maxWidth: number
  maxHeight: number
  visibleLines: string[]
  scrollOffset: number
  maxScroll: number
}

function DetailsPanel({
  selected,
  statusColor,
  releaseNotes,
  mode,
  viewMode,
  maxWidth,
  maxHeight,
  visibleLines,
  scrollOffset,
  maxScroll,
}: DetailsPanelProps) {
  const headerLines = viewMode === 'details' ? 3 : 4
  const contentHeight = Math.max(4, maxHeight - headerLines - 1)
  const releaseCount =
    releaseNotes.status === 'ready' && releaseNotes.notes
      ? releaseNotes.notes.count()
      : selected.releases

  return (
    <Box flexDirection="column">
      <Text color={THEME.accent}>
        {viewMode === 'details' ? 'Release Notes Details' : 'Release Notes Summary'}
      </Text>
      <Text color={THEME.divider}>{'-'.repeat(Math.max(0, maxWidth))}</Text>
      <Text color={THEME.muted}>
        Releases: {selected.to ?? '—'} → {selected.from ?? '—'} ({releaseCount ?? '—'} versions)
      </Text>
      {viewMode === 'summary' && (
        <Text color={statusColor}>
          {selected.name} ({selected.status})
        </Text>
      )}

      <Box flexDirection="column" marginTop={1}>
        {viewMode === 'summary' ? (
          <>
            {releaseNotes.status === 'loading' && (
              <Text color={THEME.muted}>Fetching release notes...</Text>
            )}
            {releaseNotes.status === 'error' && (
              <Text color={THEME.removed}>
                {releaseNotes.message ?? 'Failed to load release notes'}
              </Text>
            )}
            {releaseNotes.status === 'empty' && (
              <Text color={THEME.muted}>{releaseNotes.message ?? 'No release notes found'}</Text>
            )}
            {(releaseNotes.status === 'ready' || releaseNotes.status === 'loading') && releaseNotes.notes && (
              <ReleaseNotesSummary
                notes={releaseNotes.notes}
                mode={mode}
                maxWidth={maxWidth}
                maxHeight={contentHeight}
              />
            )}
          </>
        ) : (
          <Box flexDirection="column">
            {visibleLines.length === 0 ? (
              <Text color={THEME.muted}>No release notes found</Text>
            ) : (
              visibleLines.map((line, index) => (
                <Text key={`${line}-${index}`} color={THEME.muted}>
                  {line}
                </Text>
              ))
            )}
          </Box>
        )}
      </Box>
    </Box>
  )
}

interface ReleaseNotesSummaryProps {
  notes: ReleaseNotesCollection
  mode: 'summary' | 'full'
  maxWidth: number
  maxHeight: number
}

function ReleaseNotesSummary({ notes, mode, maxWidth, maxHeight }: ReleaseNotesSummaryProps) {
  if (notes.isEmpty()) {
    return <Text color={THEME.muted}>No release notes found</Text>
  }

  if (mode === 'full' || notes.hasUnstructuredReleases()) {
    const allChanges = notes.getAllBulletPoints().slice(0, Math.max(1, maxHeight - 1))
    return (
      <Box flexDirection="column">
        <Text color={THEME.changes}>All Changes</Text>
        {allChanges.length === 0 ? (
          <Text color={THEME.muted}>No bullet points available</Text>
        ) : (
          allChanges.map((item, index) => (
            <Text key={`${item}-${index}`} color={THEME.muted}>
              - {truncate(item, maxWidth - 4)}
            </Text>
          ))
        )}
      </Box>
    )
  }

  const leftSections = [
    { title: 'Changes', color: THEME.changes, items: notes.getChanges() },
    { title: 'Fixes', color: THEME.fixes, items: notes.getFixes() },
    { title: 'Removed', color: THEME.removedSection, items: notes.getRemoved() },
  ]
  const rightSections = [
    { title: 'Breaking', color: THEME.breaking, items: notes.getBreakingChanges() },
    { title: 'Security', color: THEME.security, items: notes.getSecurity() },
    { title: 'Deprecated', color: THEME.deprecated, items: notes.getDeprecated() },
  ]

  const columnWidth = Math.max(20, Math.floor(maxWidth / 2) - 2)

  return (
    <Box flexDirection="row" columnGap={3}>
      <Box flexDirection="column" width={columnWidth}>
        {leftSections.map((section) => (
          <Section key={section.title} section={section} maxWidth={columnWidth} maxItems={3} />
        ))}
      </Box>
      <Box flexDirection="column" width={columnWidth}>
        {rightSections.map((section) => (
          <Section key={section.title} section={section} maxWidth={columnWidth} maxItems={3} />
        ))}
      </Box>
    </Box>
  )
}

interface SectionProps {
  section: { title: string; color: string; items: string[] }
  maxWidth: number
  maxItems: number
}

function Section({ section, maxWidth, maxItems }: SectionProps) {
  if (section.items.length === 0) {
    return null
  }
  const items = section.items.slice(0, maxItems)
  const remaining = section.items.length - items.length

  return (
    <Box flexDirection="column" marginBottom={1}>
      <Text color={section.color}>{section.title}:</Text>
      {items.map((item, index) => (
        <Text key={`${section.title}-${index}`} color={THEME.muted}>
          - {truncate(item, maxWidth - 4)}
        </Text>
      ))}
      {remaining > 0 && <Text color={THEME.muted}>+{remaining} more</Text>}
    </Box>
  )
}

function buildDetailsLines(
  releaseNotes: ReleaseNotesState,
  selected: TuiPackageChange | undefined,
  maxWidth: number,
): string[] {
  if (!selected) {
    return ['No package selected']
  }
  if (releaseNotes.status === 'loading' && (!releaseNotes.notes || releaseNotes.notes.isEmpty())) {
    return ['Fetching release notes...']
  }
  if (releaseNotes.status === 'error') {
    return [releaseNotes.message ?? 'Failed to load release notes']
  }
  if (releaseNotes.status === 'empty' || !releaseNotes.notes || releaseNotes.notes.isEmpty()) {
    return ['No release notes found']
  }

  const lines: string[] = []
  if (releaseNotes.status === 'loading') {
    lines.push('Fetching updated release notes...')
    lines.push('')
  }
  const separator = '-'.repeat(Math.min(maxWidth, 40))

  for (const release of releaseNotes.notes.getReleases()) {
    const title = release.title && release.title !== release.tagName ? ` - ${release.title}` : ''
    const header = `${release.tagName}${title}`
    lines.push(...wrapText(header, maxWidth))
    const dateString = release.date.toISOString().slice(0, 10)
    lines.push(`Date: ${dateString}`)
    if (release.url) {
      lines.push(...wrapText(`URL: ${release.url}`, maxWidth))
    }
    lines.push('')

    const bodyLines = release.getBody().split('\n')
    for (const line of bodyLines) {
      if (!line.trim()) {
        lines.push('')
        continue
      }
      const trimmed = line.replace(/\s+$/, '')
      lines.push(...wrapText(trimmed, maxWidth))
    }

    lines.push('')
    lines.push(separator)
    lines.push('')
  }

  return lines
}

function wrapText(text: string, width: number): string[] {
  if (width <= 0) return ['']
  const words = text.split(/\s+/)
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    if (!current) {
      if (word.length <= width) {
        current = word
      } else {
        lines.push(...hardWrap(word, width))
      }
      continue
    }

    if ((current + ' ' + word).length <= width) {
      current = `${current} ${word}`
      continue
    }

    lines.push(current)
    if (word.length <= width) {
      current = word
    } else {
      lines.push(...hardWrap(word, width))
      current = ''
    }
  }

  if (current) {
    lines.push(current)
  }

  return lines.length ? lines : ['']
}

function hardWrap(text: string, width: number): string[] {
  const lines: string[] = []
  for (let i = 0; i < text.length; i += width) {
    lines.push(text.slice(i, i + width))
  }
  return lines
}
