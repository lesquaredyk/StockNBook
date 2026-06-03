"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { useInventoryController } from "@/hooks/useInventory";
import {
    BranchListItem,
    CategoryPills,
    EmptyInventory,
    InventoryDialogs,
    InventoryStats,
    PageHeader,
    ProductTable,
    SearchAndActions,
    StoreIcon,
} from "./_shared";

export default function OwnerInventory() {
    const inv = useInventoryController();
    const [branchSearch, setBranchSearch] = React.useState("");

    const filteredBranches = React.useMemo(() => {
        const q = branchSearch.trim().toLowerCase();

        if (!q) return inv.branches;

        return inv.branches.filter((branch) =>
            branch.branchName.toLowerCase().includes(q)
        );
    }, [branchSearch, inv.branches]);

    return (
        <>
            <PageHeader
                title="Inventory"
                badge="By Branch"
                role={inv.role}
                onRefresh={() => void inv.refreshAll()}
            />

            <section className="px-5 py-5">
                <div className="grid gap-4 xl:grid-cols-[300px_1fr]">
                    <section className="rounded-[16px] border border-[#E6DDF0] bg-white p-4 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h2 className="font-serif text-base font-semibold text-[#1A1220]">
                                    Branches
                                </h2>
                                <p className="text-xs text-[#9B8AAA]">
                                    {filteredBranches.length} shown / {inv.branches.length} total
                                </p>
                            </div>

                            <StoreIcon />
                        </div>

                        <div className="relative mb-3">
                            <Search
                                size={14}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B8AAA]"
                            />

                            <input
                                value={branchSearch}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    setBranchSearch(e.target.value)
                                }
                                placeholder="Search branch..."
                                className="w-full rounded-xl border border-[#E3D8EA] bg-white px-3 py-2.5 pl-9 text-sm text-[#1A1220] outline-none placeholder:text-[#9B8AAA] focus:border-[#2B174C]"
                            />
                        </div>

                        <div className="max-h-[560px] space-y-2 overflow-y-auto pr-1">
                            {filteredBranches.length === 0 ? (
                                <p className="rounded-xl border border-dashed border-[#E6DDF0] bg-[#FFFCF7] p-4 text-sm text-[#9B8AAA]">
                                    No matching branches found.
                                </p>
                            ) : (
                                filteredBranches.map((branch) => (
                                    <BranchListItem
                                        key={branch.id}
                                        branch={branch}
                                        products={inv.branchGroups[String(branch.id)] || []}
                                        selected={inv.selectedBranchId === String(branch.id)}
                                        onClick={() => inv.setSelectedBranchId(String(branch.id))}
                                    />
                                ))
                            )}
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-[16px] border border-[#E6DDF0] bg-white shadow-sm">
                        <div className="border-b border-[#E6DDF0] bg-[#FFFCF7] px-4 py-4">
                            <p className="font-serif text-lg font-semibold text-[#1A1220]">
                                {inv.selectedBranch?.branchName || "Select a Branch"}
                            </p>

                            <p className="text-xs text-[#8A7A91]">
                                {inv.selectedBranch
                                    ? `${inv.baseProducts.length} products in this branch.`
                                    : "Choose a branch from the list to view inventory."}
                            </p>
                        </div>

                        {inv.selectedBranch ? (
                            <div className="space-y-4 p-4">
                                <InventoryStats products={inv.baseProducts} />

                                <SearchAndActions
                                    search={inv.search}
                                    setSearch={inv.setSearch}
                                    isOwner
                                    onManageCategories={inv.openManageCategories}
                                    onAddProduct={inv.openAddProduct}
                                />

                                <CategoryPills
                                    categories={inv.categories}
                                    selectedCategory={inv.selectedCategory}
                                    setSelectedCategory={inv.setSelectedCategory}
                                />

                                {inv.filteredProducts.length === 0 ? (
                                    <EmptyInventory message="No products found for this branch." />
                                ) : (
                                    <ProductTable
                                        products={inv.filteredProducts}
                                        isOwner
                                        onEdit={inv.handleEditProduct}
                                        onDelete={inv.requestDeleteProduct}
                                    />
                                )}
                            </div>
                        ) : (
                            <div className="flex min-h-[420px] items-center justify-center p-4">
                                <p className="text-sm text-[#9B8AAA]">
                                    Select a branch to view its inventory.
                                </p>
                            </div>
                        )}
                    </section>
                </div>
            </section>

            <InventoryDialogs inv={inv} />
        </>
    );
}