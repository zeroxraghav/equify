import { query } from "./_generated/server";


const getUserBalances = query({
    handler: async(ctx) => {
        // 1-1 expenses
        const user = await ctx.runQuery(api.users.getCurrentUser);
        
        const expenses = (await ctx.db.query("expenses").collect()).filter((exp) => !exp.groupId && (exp.paidBy == user._id || exp.splits.some((split) => split.userId === user._id)))

        const youOwe = 0;
        const youAreOwed = 0;
        const balanceByUser = {};

        for (const exp of expenses) {
            const isUserPayer = exp.paidBy == user._id;
            const userSplit = exp.splits.find((s) => s.userId === user._id);

            if (isUserPayer) {
                for (const s of exp.splits) {
                    if (s.userId == user._id) continue;

                    youAreOwed += s.amount;
                    (balanceByUser[s.userId] ??= {owed:0, youOwe:0}).owed += s.amount;                    
                }
            }
            else if (userSplit && !userSplit.hasPaid) {
                youOwe += userSplit.amount;
                (balanceByUser[exp.paidBy] ??= {owed:0, youOwe:0}).youOwe += userSplit.amount;
            }
        }

        const settlements = (await ctx.db.query("settlements").collect()).filter((s) => !s.groupId && (s.paidBy == user._id || s.paidTo === user._id))

        for (const s of settlements) {
            if (s.paidBy == user._id) {
                youOwe -= s.amount;
                (balanceByUser[s.paidTo] ??= {owed:0, youOwe:0}).youOwe -= s.amount;
            }

            else {
                youAreOwed -= s.amount;
                (balanceByUser[s.paidBy] ??= {owed:0, youOwe:0}).owed -= s.amount;
            }
        }

        const youOweList = [];
        const youAreOwedList = [];

        for (const [user, bal] of Object.entries(balanceByUser)) {
            const net = bal.owed - bal.youOwe;
            if (net == 0) continue;
            
            const details = await ctx.db.get(user);
            const res = {
                id: user,
                name: details.name,
                imageURL: details.imageURL,
                amount: Math.abs(net)
            }
            if (net > 0) {
                // They owe you
                youAreOwedList.push(res);
            } 
            else if (net < 0) {
                // You owe them
                youOweList.push(res);
            }
        }

        return {
            youOwe,
            youAreOwed,
            totalBalance: youAreOwed - youOwe,
            oweDetails: {youOwe: youOweList, youAreOwed: youAreOwedList}
        }
    }
})