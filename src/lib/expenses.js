/**
 * Company spend, under the three headings the client's sheet reads.
 *
 * The Expenses module keeps one flat list of categories. Revenue, the
 * dashboard and the payment desk all want them grouped, and all three
 * used to read the same invented table to do it. This is the only
 * mapping between the server's categories and those headings, so a
 * category nobody thought of lands under Office rather than falling out
 * of the totals altogether.
 */
export const EXPENSE_GROUPS = {
  office: ['Rent', 'Electricity', 'Internet', 'Marketing', 'Office expenses', 'Travel', 'Software', 'Miscellaneous'],
  staff: ['Staff salary', 'Incentives'],
  business: ['Vendor payments', 'Bank charges', 'Gateway charges'],
};

/** Every category the mapping does not name, so nothing is lost. */
const NAMED = new Set(Object.values(EXPENSE_GROUPS).flat());

/**
 * `[{ _id: 'Rent', amount: 85000 }]` as the page wants to read it.
 *
 * Every category is listed even at nought, so a heading does not
 * quietly lose a line in the month nobody spent on it.
 */
export function groupExpenses(byCategory = []) {
  const amountOf = (category) =>
    Number(byCategory.find((e) => (e?._id ?? e?.category) === category)?.amount || 0);

  const groups = Object.fromEntries(
    Object.entries(EXPENSE_GROUPS).map(([group, categories]) => [
      group,
      categories.map((label) => ({ label, amount: amountOf(label) })),
    ]),
  );

  // Anything the server has that this file has not heard of is still
  // spend, and still has to appear in a total somebody reconciles.
  const strays = byCategory
    .filter((e) => !NAMED.has(e?._id ?? e?.category))
    .map((e) => ({ label: e?._id ?? e?.category ?? 'Other', amount: Number(e?.amount || 0) }));
  groups.office = [...groups.office, ...strays];

  const sum = (list) => list.reduce((s, x) => s + Number(x.amount || 0), 0);
  const officeCost = sum(groups.office);
  const staffCost = sum(groups.staff);
  const businessCost = sum(groups.business);

  return {
    ...groups,
    officeCost,
    staffCost,
    businessCost,
    total: officeCost + staffCost + businessCost,
  };
}
