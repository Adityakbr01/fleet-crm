export const getWeekLabel = (row, index) => {
  if (row?.__weekLabel) return row.__weekLabel;

  const rawWeek =
    row?.week_name ?? row?.week ?? row?.week_number ?? row?.week_no;

  if (rawWeek === undefined || rawWeek === null || rawWeek === "") {
    return `Week ${index + 1}`;
  }

  const weekText = String(rawWeek).trim();
  return /^week\s/i.test(weekText) ? weekText : `Week ${weekText}`;
};

export const numberValue = (value) => Number(value || 0);

export const normalizeWeeklyRows = (payload) => {
  const data = payload?.data ?? payload;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.lasttenweek)) return data.lasttenweek;
  if (Array.isArray(data?.lastTenWeek)) return data.lastTenWeek;
  if (Array.isArray(data?.last_ten_week)) return data.last_ten_week;
  if (Array.isArray(data?.latestweek)) return data.latestweek;
  if (Array.isArray(data?.latestWeek)) return data.latestWeek;
  if (Array.isArray(data?.latest_week)) return data.latest_week;

  return [];
};

export const toWeeklyRows = (payload) =>
  normalizeWeeklyRows(payload).map((row, index) => ({
    ...row,
    __weekLabel: getWeekLabel(row, index),
  }));

export const getWeeklyClosing = (row) =>
  numberValue(row?.opening_balance) +
  numberValue(row?.finalPayout) -
  numberValue(row?.driver_payment);

const WeeklyPerformanceTable = ({
  reportData,
  emptyMessage = "No data available for the selected driver and year",
}) => {
  if (!reportData || reportData.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">{emptyMessage}</p>
    );
  }

  const colHeaderClass =
    "border border-gray-300 p-2 text-center text-xs font-bold whitespace-nowrap bg-blue-900 text-white";
  const cellClass =
    "border border-gray-300 p-2 text-right text-xs whitespace-nowrap";
  const weekCellClass =
    "border border-gray-300 p-2 text-left text-xs font-semibold whitespace-nowrap sticky left-0 bg-white";

  return (
    <div className="max-h-[500px] overflow-y-auto rounded-lg w-full">
      <table className="w-full text-xs border-collapse">
        <thead className="sticky top-0 z-10 bg-blue-900">
          <tr>
            <th
              className={`${colHeaderClass} sticky left-0 z-auto bg-blue-900`}
            >
              Week
            </th>
            <th className={colHeaderClass} title="Opening Balance">
              Opening
            </th>
            <th className={`${colHeaderClass} bg-green-700`} title="Sum of MBG">
              MBG
            </th>
            <th className={colHeaderClass} title="Weekly Acceptance Percentage">
              Acc%
            </th>
            <th className={colHeaderClass} title="Total Earnings">
              Tot Earn
            </th>
            <th className={colHeaderClass} title="Revenue Incentive">
              Rev Inc
            </th>
            <th className={colHeaderClass} title="Additional Incentive">
              Add Inc
            </th>
            <th className={colHeaderClass} title="Total Collection">
              Tot Coll
            </th>
            <th className={colHeaderClass} title="Total Cash Deposit">
              Tot CD
            </th>
            <th className={colHeaderClass} title="Total QR Deposit">
              Tot QD
            </th>
            <th className={`${colHeaderClass} bg-red-700`} title="Cash Balance">
              Cash Bal
            </th>
            <th
              className={`${colHeaderClass} bg-orange-500`}
              title="Total Payout"
            >
              Tot Payout
            </th>
            <th className={colHeaderClass} title="Payout After Adjustments">
              Payout Adj
            </th>
            <th className={colHeaderClass}>Credit</th>
            <th className={colHeaderClass}>Debit</th>
            <th className={colHeaderClass} title="Customer Trips Completed">
              Cust Trips
            </th>
            <th className={`${colHeaderClass} bg-yellow-500 text-black`}>
              Final Payout
            </th>
            <th className={colHeaderClass} title="Paid Amount">
              Paid
            </th>
            <th className={`${colHeaderClass} bg-yellow-500 text-black`}>
              Closing
            </th>
          </tr>
        </thead>
        <tbody>
          {reportData.map((row, index) => {
            const rowBg = index % 2 === 0 ? "bg-white" : "bg-gray-50";
            const closing = getWeeklyClosing(row);

            return (
              <tr
                key={`${getWeekLabel(row, index)}-${index}`}
                className={`${rowBg} hover:bg-blue-50`}
              >
                <td className={`${weekCellClass} ${rowBg}`}>
                  {getWeekLabel(row, index)}
                </td>
                <td className={cellClass}>{row.opening_balance}</td>
                <td className={`${cellClass} text-green-700 font-bold`}>
                  {row.mbg}
                </td>
                <td className={cellClass}>{row.acceptence}%</td>
                <td className={cellClass}>{row.totalearings}</td>
                <td className={cellClass}>{row.totalrevenue}</td>
                <td className={cellClass}>{row.additionalIncentive}</td>
                <td className={cellClass}>{row.totalCashCollected}</td>
                <td className={cellClass}>{row.totalCashDepositAmount}</td>
                <td className={cellClass}>{row.totalQRDepositAmount}</td>
                <td
                  className={`${cellClass} bg-red-100 text-red-700 font-semibold`}
                >
                  {row.cashBalance}
                </td>
                <td
                  className={`${cellClass} bg-orange-100 text-orange-700 font-semibold`}
                >
                  {row.totalPayout}
                </td>
                <td className={cellClass}>{row.payoutAdj}</td>
                <td className={cellClass}>{row.totalCreditAmount}</td>
                <td className={cellClass}>{row.totalDebiitAmount}</td>
                <td className={cellClass}>{row.totalCustomerTipsAmount}</td>
                <td
                  className={`${cellClass} font-bold text-sm ${
                    numberValue(row.finalPayout) >= 0
                      ? "text-green-700 bg-green-50"
                      : "text-red-700 bg-red-50"
                  }`}
                >
                  {row.finalPayout}
                </td>
                <td className={cellClass}>{row.driver_payment}</td>
                <td
                  className={`${cellClass} font-bold text-sm ${
                    closing >= 0
                      ? "text-green-700 bg-green-50"
                      : "text-red-700 bg-red-50"
                  }`}
                >
                  {closing}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default WeeklyPerformanceTable;
