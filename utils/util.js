const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

const formatTime = t => {
  const d = new Date(t);
  return `${formatNumber(d.getMinutes())}:${formatNumber(d.getSeconds())}`;
}

const formatPlayCount = num => {
  if (num < 10000) {
    return num;
  }
  const W = num / 10000;
  return W % 1 >= 0.1 ? `${W.toFixed(1)}万` : `${Math.floor(W)}万`;
}

module.exports = {
  formatNumber,
  formatTime,
  formatPlayCount
}
