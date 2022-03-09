module.exports = {
  '!(cypress/**/*)*.{js,jsx,ts,tsx}': ['eslint --max-warnings=0', () => 'tsc-files --noEmit'],
  '!(cypress/**/*)*.{js,jsx,ts,tsx,json,css,scss.md}': ['prettier --write'],
};
