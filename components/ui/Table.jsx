import React from "react";

const Table = React.forwardRef(({ className = "", ...props }, ref) => (
  <div className="w-full overflow-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-card)]">
    <table
      ref={ref}
      className={`w-full text-sm ${className}`}
      {...props}
    />
  </div>
));
Table.displayName = "Table";

const THead = React.forwardRef(({ className = "", ...props }, ref) => (
  <thead
    ref={ref}
    className={`bg-[var(--color-surface-2)] border-b border-[var(--color-border)] ${className}`}
    {...props}
  />
));
THead.displayName = "THead";

const TBody = React.forwardRef(({ className = "", ...props }, ref) => (
  <tbody
    ref={ref}
    className={`divide-y divide-[var(--color-border)] ${className}`}
    {...props}
  />
));
TBody.displayName = "TBody";

const TR = React.forwardRef(({ className = "", ...props }, ref) => (
  <tr
    ref={ref}
    className={`transition-colors hover:bg-[var(--color-surface-2)] ${className}`}
    {...props}
  />
));
TR.displayName = "TR";

const TH = React.forwardRef(({ className = "", ...props }, ref) => (
  <th
    ref={ref}
    className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)] ${className}`}
    {...props}
  />
));
TH.displayName = "TH";

const TD = React.forwardRef(({ className = "", ...props }, ref) => (
  <td
    ref={ref}
    className={`px-4 py-3 text-sm text-[var(--color-foreground)] ${className}`}
    {...props}
  />
));
TD.displayName = "TD";

export { Table, THead, TBody, TR, TH, TD };
