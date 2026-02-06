/**
 * Example: Responsive Page Implementation
 *
 * This demonstrates how to integrate the responsive UI components
 * into an existing page with minimal changes.
 *
 * This is a reference implementation - adapt the pattern to your pages.
 */

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  PageLayout,
  PageHeader,
  ContentCard,
  ResponsiveTable,
  ActionButton,
  FormField,
  LoadingState,
  EmptyState,
  ErrorState,
} from "@/components/layout";
import { SidebarSales } from "@/components/sidebar/sidebar";
import { MobileBottomNavSales } from "@/components/mobile-bottom-nav";
import { Plus, RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";

interface DataItem {
  id: number;
  name: string;
  status: string;
  points: number;
}

function ResponsivePageExample() {
  const { resolvedTheme } = useTheme();
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Your API call here
      // const result = await api.getData();
      // setData(result);

      // Mock data for example
      setTimeout(() => {
        setData([
          { id: 1, name: "Item 1", status: "active", points: 100 },
          { id: 2, name: "Item 2", status: "pending", points: 200 },
        ]);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    toast.success("Refreshing data...");
    fetchData();
  };

  const handleCreate = () => {
    // Handle create action
    toast.success("Create new item");
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - Keep as is */}
      <SidebarSales />

      {/* Main Content - Wrap with PageLayout */}
      <PageLayout maxWidth="2xl" className="flex-1">
        {/* Page Header - Replaces manual header divs */}
        <PageHeader
          title="Dashboard"
          subtitle="Manage your distributors and track redemptions"
          actions={
            <>
              <ActionButton
                variant="ghost"
                size="md"
                icon={<RefreshCw />}
                onClick={handleRefresh}
              >
                Refresh
              </ActionButton>
              <ActionButton
                variant="primary"
                size="md"
                icon={<Plus />}
                onClick={handleCreate}
                fullWidthOnMobile
              >
                Create New
              </ActionButton>
            </>
          }
        />

        {/* Stats Section - Wrap in ContentCard */}
        <ContentCard
          title="Statistics"
          subtitle="Overview of your account"
          padding="lg"
          className="mb-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              className={`p-4 rounded-lg border ${
                resolvedTheme === "dark"
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <p className="text-sm text-gray-500 mb-1">Total Points</p>
              <p className="text-2xl font-bold">1,234</p>
            </div>
            <div
              className={`p-4 rounded-lg border ${
                resolvedTheme === "dark"
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <p className="text-sm text-gray-500 mb-1">Active Items</p>
              <p className="text-2xl font-bold">42</p>
            </div>
            <div
              className={`p-4 rounded-lg border ${
                resolvedTheme === "dark"
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <p className="text-sm text-gray-500 mb-1">Pending</p>
              <p className="text-2xl font-bold">8</p>
            </div>
          </div>
        </ContentCard>

        {/* Data Table Section */}
        <ContentCard
          title="Recent Activity"
          padding="none"
          headerActions={
            <ActionButton variant="ghost" size="sm" icon={<RefreshCw />}>
              Refresh
            </ActionButton>
          }
        >
          {/* Loading State */}
          {loading && (
            <div className="p-12">
              <LoadingState message="Loading data..." size="lg" />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-12">
              <ErrorState
                title="Failed to load data"
                message={error}
                action={
                  <ActionButton onClick={fetchData} variant="primary">
                    Try Again
                  </ActionButton>
                }
              />
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && data.length === 0 && (
            <div className="p-12">
              <EmptyState
                title="No data available"
                description="Get started by creating your first item"
                action={
                  <ActionButton onClick={handleCreate} variant="primary">
                    Create Item
                  </ActionButton>
                }
              />
            </div>
          )}

          {/* Table - Wrap with ResponsiveTable */}
          {!loading && !error && data.length > 0 && (
            <ResponsiveTable maxHeight="500px">
              <table className="min-w-full">
                <thead
                  className={`sticky top-0 ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 border-gray-700"
                      : "bg-gray-50 border-gray-200"
                  } border-b`}
                >
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                      Points
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody
                  className={`${
                    resolvedTheme === "dark" ? "bg-gray-900" : "bg-white"
                  }`}
                >
                  {data.map((item) => (
                    <tr
                      key={item.id}
                      className={`border-b ${
                        resolvedTheme === "dark"
                          ? "border-gray-800 hover:bg-gray-800/50"
                          : "border-gray-200 hover:bg-gray-50"
                      } transition-colors`}
                    >
                      <td className="px-4 py-3 text-sm">{item.id}</td>
                      <td className="px-4 py-3 text-sm">{item.name}</td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                            item.status === "active"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-semibold">
                        {item.points}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <ActionButton variant="ghost" size="sm">
                          View
                        </ActionButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ResponsiveTable>
          )}
        </ContentCard>

        {/* Form Section Example */}
        <ContentCard title="Quick Actions" padding="lg" className="mt-6">
          <form className="space-y-4 max-w-md">
            <FormField
              label="Item Name"
              type="text"
              placeholder="Enter item name"
              required
            />
            <FormField
              label="Points"
              type="number"
              placeholder="Enter points"
              helperText="Minimum 100 points required"
            />
            <ActionButton
              variant="primary"
              size="lg"
              fullWidthOnMobile
              type="submit"
            >
              Submit
            </ActionButton>
          </form>
        </ContentCard>
      </PageLayout>

      {/* Mobile Bottom Nav - Keep as is */}
      <MobileBottomNavSales />
    </div>
  );
}

export default ResponsivePageExample;
