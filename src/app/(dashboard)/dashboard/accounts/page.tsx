import Link from "next/link";

const accounts = [
  {
    name: "Everyday Checking",
    bank: "Green Bank",
    balance: 32840,
    change: 720,
    color: "from-[#D9F9E2] to-[#D4F8D9]",
  },
  {
    name: "Savings Vault",
    bank: "Nest Savings",
    balance: 184200,
    change: 4300,
    color: "from-[#F8F3FF] to-[#E8DEFF]",
  },
  {
    name: "Investments",
    bank: "Growth Fund",
    balance: 92400,
    change: 1220,
    color: "from-[#FFECD9] to-[#FFF4E1]",
  },
];

export default function Page() {
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  return (
    <div className="space-y-8">
      <div className="glass-panel p-8 rounded-[32px] border border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-float">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] font-black text-text-light">
              Accounts overview
            </p>
            <h1 className="text-3xl sm:text-4xl font-black text-text-main mt-3">
              Connected bank feeds
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-text-light">
              View all linked accounts, balances, and automated insights for your savings, checking, and investment goals.
            </p>
          </div>

          <div className="rounded-3xl bg-primary/10 px-5 py-4 text-primary text-sm font-black uppercase tracking-[0.35em]">
            Total balance: ₹{totalBalance.toLocaleString("en-IN")}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {accounts.map((account) => (
          <div
            key={account.name}
            className="rounded-[32px] border border-white/10 bg-white/70 dark:bg-white/5 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className={`rounded-3xl bg-gradient-to-br ${account.color} p-4`}>
              <p className="text-[10px] uppercase tracking-[0.35em] font-black text-text-light">
                {account.bank}
              </p>
              <h2 className="mt-4 text-xl font-black text-text-main">{account.name}</h2>
            </div>

            <div className="mt-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-text-light font-black">
                  Current balance
                </p>
                <p className="mt-3 text-3xl font-black text-text-main">
                  ₹{account.balance.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="rounded-3xl bg-success/10 px-3 py-2 text-sm font-black uppercase tracking-[0.35em] text-success">
                +₹{account.change.toLocaleString("en-IN")}
              </div>
            </div>

            <div className="mt-6 space-y-3 text-sm text-text-light">
              <p>Account status: Active</p>
              <p>Synced today</p>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-panel p-8 rounded-[32px] border border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-float">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] font-black text-text-light">
              Account actions
            </p>
            <h2 className="text-xl font-black text-text-main mt-2">
              Keep your feeds fresh
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-text-light">
              Connect a new bank account or refresh existing feeds to keep your dashboard up to date.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard/transactions"
              className="rounded-3xl bg-primary text-white px-5 py-3 text-sm font-black uppercase tracking-[0.35em] text-center hover:brightness-110 transition"
            >
              Review transactions
            </Link>
            <Link
              href="/dashboard/goals"
              className="rounded-3xl border border-white/10 bg-white/10 text-text-main px-5 py-3 text-sm font-black uppercase tracking-[0.35em] text-center hover:bg-white/20 transition"
            >
              Manage goals
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
