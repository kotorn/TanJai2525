export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section className="h-full w-full">
        {/* Can add inventory-specific sub-nav or context providers here */}
        {children}
    </section>
  )
}
