export function ResourceTableHeader() {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_7rem_8rem] border-b bg-muted/30 px-4 py-3 text-xs font-medium uppercase text-muted-foreground">
      <span>Name</span>
      <span>Size</span>
      <span className="text-right">Updated</span>
    </div>
  );
}
