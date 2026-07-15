import { STORYBOOK_URL } from 'src/config'
import { Card } from '@soroush.tech/design-system/Card'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableControl,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  useTablePagination,
  useTableSort,
} from '@soroush.tech/design-system/Table'
import { CardTitle } from './CardTitle'
import { SERVICES } from './TableCard.data'

export function TableCard() {
  const sort = useTableSort(['service', 'latency'])
  const pagination = useTablePagination({ defaultRowsPerPage: 5 })

  return (
    <Card
      elevation={0}
      bg="paper"
      p={5}
      width="100%"
      variant="bracketBox"
      title={
        <CardTitle
          title="TABLE"
          storybookHref={`${STORYBOOK_URL}?path=/docs/theme-table-table--docs`}
        />
      }
      caption="Semantic table primitives with context-driven th/td cells, sortable headers, hoverable rows, and a footer pagination control."
    >
      <TableContainer>
        <Table size="sm" shouldHideSortIcon={false}>
          <TableHead>
            <TableRow>
              <TableCell sortDirection={sort.service.isActive ? sort.service.direction : undefined}>
                <TableSortLabel {...sort.service}>Service</TableSortLabel>
              </TableCell>
              <TableCell>Region</TableCell>
              <TableCell>Status</TableCell>
              <TableCell
                align="right"
                sortDirection={sort.latency.isActive ? sort.latency.direction : undefined}
              >
                <TableSortLabel {...sort.latency}>Latency (ms)</TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableControl data={SERVICES} sort={sort} pagination={pagination}>
              {(row) => (
                <TableRow key={row.service} isHoverable>
                  <TableCell>{row.service}</TableCell>
                  <TableCell>{row.region}</TableCell>
                  <TableCell color={row.status === 'healthy' ? 'primary' : 'secondary'}>
                    {row.status}
                  </TableCell>
                  <TableCell align="right">{row.latency}</TableCell>
                </TableRow>
              )}
            </TableControl>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                count={SERVICES.length}
                {...pagination}
                rowsPerPageOptions={[5, 10]}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </Card>
  )
}
