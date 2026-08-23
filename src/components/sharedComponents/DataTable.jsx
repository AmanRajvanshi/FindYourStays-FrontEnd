import { Table } from 'rsuite';

const { Column, HeaderCell, Cell } = Table;

const defaultProps = {
  hover: true,
  showHeader: true,
  bordered: true,
  cellBordered: true,
  autoHeight: true,
  rowHeight: 48,
  headerHeight: 44,
};

export default function DataTable({ children, ...props }) {
  return (
    <Table {...defaultProps} {...props}>
      {children}
    </Table>
  );
}

export { Column, HeaderCell, Cell };
