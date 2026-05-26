const CurrencyFormat = ({ amount }) => (
  <>₹ {new Intl.NumberFormat('en-IN').format(amount || 0)}</>
);

export default CurrencyFormat;
