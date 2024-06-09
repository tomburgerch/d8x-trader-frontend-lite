import styles from './DataColumn.module.scss';

interface DataColumnPropsI {
  title: string;
  items: string[];
}

export const DataColumn = ({ title, items }: DataColumnPropsI) => {
  return (
    <div className={styles.root}>
      <div className={styles.title}>{title}</div>
      {items.map((item) => (
        <div key={item} className={styles.itemLine}>
          {item}
        </div>
      ))}
    </div>
  );
};
