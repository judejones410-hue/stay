/* the only file to touch on launch day.
   leave a value empty ('') and every button that needs it shows "at launch" instead of a dead link. */
window.STAY = {
  ticker: '$STAY',
  ca: '',                                   // mint address from pump.fun
  site: 'https://stay-site-ashen.vercel.app', // swap for the real domain when there is one
  x: '',                                    // e.g. https://x.com/staydotfun
  github: 'https://github.com/judejones410-hue/stay',
  keeperUrl: '',                            // public url of the keeper's /log.json (see keeper/README.md)
  keeperWallet: '',                         // the keeper's wallet, for solscan links
  rollCallUTC: 18,                          // roll call starts 18:00 utc, lasts ten minutes
  rollCallMinutes: 10,
};
