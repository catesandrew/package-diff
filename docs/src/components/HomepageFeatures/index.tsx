import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Multi-Format Support',
    description: (
      <>
        Supports npm, pnpm, yarn, Composer, and plain package.json lockfiles.
        Monorepo-aware discovery walks from your working directory up to the git
        root, reporting diffs per lockfile.
      </>
    ),
  },
  {
    title: 'SemVer Classification',
    description: (
      <>
        Every dependency change is classified as added, removed, updated, or
        downgraded with major, minor, or patch magnitude. Release counts are
        estimated from the package registry.
      </>
    ),
  },
  {
    title: 'Release Notes',
    description: (
      <>
        Fetch and display release notes between any two versions of a dependency.
        Sources include GitHub Releases, CHANGELOG.md files, and local vendor
        directories.
      </>
    ),
  },
];

function Feature({title, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
