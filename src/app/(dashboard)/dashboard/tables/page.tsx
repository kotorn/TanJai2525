import { getTables } from "@/features/tables/actions";
import TableList from "@/features/tables/components/TableList";

export default async function TablesPage() {
    const tables = await getTables();

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <TableList tables={tables} />
        </div>
    );
}
