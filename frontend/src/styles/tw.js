// Shared Tailwind utility-class constants.
// These are plain JavaScript strings (NOT CSS classes) that keep repeated
// utility combinations consistent across pages, matching the exact values
// that used to live in styles.css. Nothing here is a stylesheet selector —
// it's just centralized strings passed into `className`.

export const text = {
  muted: "text-rc-muted",
  tiny: "text-[12px]",
  small: "text-[13px]",
  nowrap: "whitespace-nowrap",
  strong: "font-bold",
  gradient: "bg-rc-grad bg-clip-text text-transparent",
};

export const pageHead =
  "flex justify-between items-start gap-5 mb-[18px] max-[680px]:flex-col";
export const pageTitleH1 =
  "text-[17px] m-0 mb-[5px] font-bold text-[#20263a]";
export const pageTitleP = "text-[11px] m-0 text-[#9097a8]";
export const headActions =
  "flex gap-2 items-center max-[680px]:w-full max-[680px]:flex-wrap";

// Buttons
const btnBase =
  "min-h-[32px] rounded-[6px] px-3 inline-flex items-center justify-center gap-[7px] text-[12px] font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed max-[390px]:min-h-[34px]";
export const button = {
  date: `${btnBase} border border-[#e0e3eb] bg-white text-[#657086] hover:-translate-y-0.5 hover:shadow-[0_6px_15px_rgba(48,55,92,0.1)]`,
  secondary: `${btnBase} border border-[#e0e3eb] bg-white text-[#657086] hover:-translate-y-0.5 hover:shadow-[0_6px_15px_rgba(48,55,92,0.1)]`,
  primary: `${btnBase} border-0 text-white bg-rc-grad shadow-[0_4px_12px_rgba(107,77,237,0.16)] hover:-translate-y-0.5 hover:shadow-[0_6px_15px_rgba(48,55,92,0.1)]`,
  danger: `${btnBase} border-0 bg-[#fff0f1] text-[#d84d5a]`,
  icon: "w-[13px] h-[13px]",
};

// Stat cards
export const statsGrid =
  "grid grid-cols-5 gap-3 mb-[15px] max-[1200px]:grid-cols-3 max-[680px]:grid-cols-2 max-[390px]:grid-cols-1";
export const summaryStrip =
  "grid grid-cols-5 gap-[10px] mb-[13px] max-[680px]:grid-cols-2";
export const statCard =
  "bg-white border border-[#eceef5] rounded-[9px] px-[13px] pt-[13px] pb-3 shadow-[0_2px_9px_rgba(46,53,88,0.025)] flex items-center gap-[11px] min-h-[76px] transition-transform duration-200 hover:-translate-y-[3px] hover:shadow-rc max-[680px]:min-h-[70px] max-[680px]:p-[10px]";
const statIconBase =
  "w-[34px] h-[34px] rounded-[9px] grid place-items-center flex-none [&>svg]:w-4";
export const statIcon = {
  "": `${statIconBase} bg-[#f1edff] text-[#714ef0]`,
  cyan: `${statIconBase} bg-[#e9fbfb] text-[#15a9b0]`,
  green: `${statIconBase} bg-[#ecfaf4] text-[#25a873]`,
  red: `${statIconBase} bg-[#fff0f1] text-[#e05460]`,
  blue: `${statIconBase} bg-[#eef5ff] text-[#4f8be5]`,
  purple: `${statIconBase} bg-[#f1edff] text-[#714ef0]`,
};
export const statBody = {
  span: "text-[12px] text-[#8f96a7] block mb-[3px]",
  strong: "text-[17px] leading-[1.15] block text-[#2a3041] max-[680px]:text-[15px]",
  small: "text-[10px] text-[#3bb77a] block mt-1",
};

// Panels
export const panel =
  "bg-white border border-[#eceef5] rounded-[9px] shadow-[0_2px_10px_rgba(46,53,88,0.025)] overflow-hidden";
export const panelPad = "p-[15px]";
export const panelHead =
  "h-[42px] px-[15px] border-b border-[#f0f1f5] flex items-center justify-between max-[680px]:h-[39px]";
export const panelHeadH3 = "text-[10px] m-0 font-[650]";
export const viewLink = "text-[8px] text-[#6a43ee] font-semibold";

export const dashboardGrid =
  "grid grid-cols-[1fr_1.35fr_1.4fr] gap-3 mb-[15px] max-[1200px]:grid-cols-2 max-[1200px]:[&>*:last-child]:col-span-2 max-[680px]:grid-cols-1 max-[680px]:[&>*:last-child]:col-span-1";
export const dashboardGridTwo =
  "grid grid-cols-[1.6fr_1fr] gap-3 mb-[15px] max-[1200px]:grid-cols-2 max-[680px]:grid-cols-1";

export const chartWrap = "h-[180px] pt-[7px] px-[10px] pb-[10px]";
export const donutWrap = "h-[170px] grid place-items-center";

export const quickGrid =
  "grid grid-cols-4 gap-[10px] mt-[11px] mb-[15px] max-[900px]:grid-cols-2 max-[680px]:grid-cols-1";
export const quickCard =
  "flex items-center gap-[10px] bg-white border border-[#eceef5] rounded-[8px] p-3 transition-transform duration-200 cursor-pointer hover:-translate-y-[3px] hover:border-[#d9d0ff] hover:shadow-rc";
export const quickIconTones = [
  "w-8 h-8 rounded-[8px] grid place-items-center bg-[#f3efff] text-rc-purple flex-none",
  "w-8 h-8 rounded-[8px] grid place-items-center bg-[#eafbfc] text-[#12aab0] flex-none",
  "w-8 h-8 rounded-[8px] grid place-items-center bg-[#edf8ff] text-[#4d8cd5] flex-none",
  "w-8 h-8 rounded-[8px] grid place-items-center bg-[#eafaf3] text-[#2fac79] flex-none",
];
export const quickCardB = "text-[12px] block";
export const quickCardSmall = "text-[10px] text-[#949bac]";
export const quickArrow = "ml-auto text-[#b4bac8]";

export const sectionLabel =
  "text-[8px] font-bold text-[#656e84] tracking-[0.08em] mt-4 mb-2";

// Tables
export const tableWrap = "overflow-auto";
export const dataTable = "w-full border-collapse min-w-[720px]";
export const th =
  "h-[34px] bg-[#fafbfe] text-[#8a92a4] text-[10px] text-left font-[650] px-[10px] border-b border-[#eceef4] whitespace-nowrap";
export const tr = "hover:bg-[#fbfaff]";
export const td =
  "h-[42px] border-b border-[#f1f2f6] px-[10px] text-[12px] text-[#596176] whitespace-nowrap";
export const tdStrong = "text-[#303649] text-[10.5px]";

export const person = "flex items-center gap-[7px]";
export const miniAvatar =
  "w-[25px] h-[25px] rounded-full bg-[#f0ebff] text-[#734ff0] grid place-items-center text-[12px] font-bold flex-none";

// Badge
const badgeBase =
  "inline-flex items-center gap-1 rounded-xl px-[7px] py-[3px] text-[12px] font-semibold";
export const badge = {
  green: `${badgeBase} bg-[#e9f9f1] text-[#23a66f]`,
  red: `${badgeBase} bg-[#fff0f1] text-[#dc5661]`,
  orange: `${badgeBase} bg-[#fff6e6] text-[#d99018]`,
  purple: `${badgeBase} bg-[#f1edff] text-[#704bed]`,
  cyan: `${badgeBase} bg-[#e9fafb] text-[#0ba5ad]`,
  blue: `${badgeBase} bg-[#eef5ff] text-[#4684d8]`,
};
export const statusDot = "w-[5px] h-[5px] rounded-full inline-block bg-current";

export const actionLink =
  "border-0 bg-transparent text-[#6844ef] text-[12px] px-1 py-[3px] disabled:opacity-50";
export const pagination =
  "h-[45px] px-3 flex justify-between items-center text-[12px] text-[#9399a9]";
export const pageNumbers = "flex gap-1";
export const pageNumber =
  "w-[25px] h-[25px] rounded-[5px] border border-[#e4e6ed] bg-white text-[#7d8496]";
export const pageNumberActive = "bg-[#6746ee] text-white border-[#6746ee]";

// Toolbar / filters
export const toolbar = "flex gap-2 items-center my-3 max-[680px]:flex-wrap";
export const searchBox =
  "h-8 border border-[#e2e5ed] rounded-[6px] bg-white flex items-center px-[9px] gap-[7px] min-w-[260px] flex-1 max-w-[520px] max-[680px]:min-w-full max-[680px]:max-w-none [&>svg]:w-[13px] [&>svg]:text-[#969daf]";
export const searchBoxInput =
  "border-0 outline-none w-full text-[12px] text-[#4e566c] bg-transparent";
export const compactSelect =
  "h-8 border border-[#e2e5ed] rounded-[6px] bg-white text-[#6d758a] text-[12px] pl-[9px] pr-6 outline-none max-[680px]:flex-1";

// Forms
export const formLayout =
  "grid grid-cols-[minmax(0,1fr)_270px] gap-[14px] items-start max-[1200px]:grid-cols-[minmax(0,1fr)_240px] max-[900px]:grid-cols-1";
export const formCard =
  "bg-white border border-[#eceef5] rounded-[9px] p-4 mb-3 max-[680px]:p-[13px]";
export const formCardH3 = "text-[12px] m-0 mb-1";
export const subtext = "text-[12px] text-[#9aa1b0] mb-[14px]";
export const formGrid =
  "grid grid-cols-2 gap-x-[14px] gap-y-3 max-[680px]:grid-cols-1";
export const formGridThree =
  "grid grid-cols-3 gap-x-[14px] gap-y-3 max-[1200px]:grid-cols-2 max-[680px]:grid-cols-1";
export const fieldFull = "col-span-full";
export const fieldLabel =
  "block text-[12px] font-semibold text-[#51596d] mb-[6px]";
export const req = "text-[#f05d66]";

const controlBase =
  "w-full border border-[#e2e5ed] rounded-[6px] bg-white text-[#485064] text-[12px] outline-none transition-shadow duration-200 focus:border-[#7959ec] focus:shadow-[0_0_0_3px_rgba(111,76,244,0.06)] disabled:opacity-60";
export const input = `${controlBase} h-[34px] px-[10px]`;
export const select = `${controlBase} h-[34px] px-[10px]`;
export const textarea = `${controlBase} p-[10px] min-h-[76px] resize-y`;
export const fieldSmall = "block text-[#a1a7b5] text-[12px] mt-1";
export const errorText = "text-[#e0525f]";

export const fileDrop =
  "border border-dashed border-[#cfd4df] rounded-[7px] min-h-[74px] flex items-center justify-center text-center text-[#9199aa] text-[12px] bg-[#fbfbfd] cursor-pointer block [&_svg]:mx-auto";

export const formActions =
  "flex justify-end gap-2 mt-[14px] pt-[14px] border-t border-[#eff0f5] max-[390px]:flex-col-reverse [&>button]:max-[390px]:w-full";

export const sideInfo =
  "sticky top-[82px] max-[900px]:static max-[900px]:grid max-[900px]:grid-cols-2 max-[900px]:gap-[10px] max-[680px]:grid-cols-1";
export const infoCard = {
  "": "bg-white border border-[#eceef5] rounded-[9px] p-[14px] mb-3",
  purple: "bg-[#faf8ff] border border-[#e9e2ff] rounded-[9px] p-[14px] mb-3",
  blue: "bg-[#f5faff] border border-[#dbeeff] rounded-[9px] p-[14px] mb-3",
};
export const infoCardH4 = "text-[12px] m-0 mb-[10px] text-[#4c5367]";
export const infoRow = "flex gap-[9px] my-[10px]";
export const infoIcon =
  "w-7 h-7 rounded-[7px] bg-[#eee8ff] text-[#704beb] grid place-items-center flex-none [&>svg]:w-[13px]";
export const infoRowB = "text-[12px] block";
export const infoRowP = "text-[12px] text-[#9299aa] mt-[3px] leading-[1.45]";

export const summaryList = "grid gap-2";
export const summaryLine =
  "flex justify-between gap-[10px] text-[12px] pb-[7px] border-b border-[#efeff4]";
export const summaryLineSpan = "text-[#8d94a6]";
export const summaryLineStrong = "text-[#3c4357]";
export const summaryTotal = "text-[12px] text-[#6442ee]";

export const workflow = "grid gap-[7px]";
export const workflowStep =
  "flex items-center gap-[7px] text-[12px] text-[#6f778b]";
export const workflowDot =
  "w-[17px] h-[17px] rounded-full bg-[#eee9ff] text-[#704ced] grid place-items-center text-[12px] font-bold flex-none";
export const workflowLine = "h-[9px] border-l border-dashed border-[#d9dce5] ml-2";

// Dropdown / notifications
export const dropdown =
  "absolute right-0 top-[41px] w-[320px] bg-white border border-[#e8eaf1] rounded-[9px] shadow-[0_15px_40px_rgba(34,40,74,0.12)] overflow-hidden z-[80] max-[680px]:fixed max-[680px]:left-3 max-[680px]:right-3 max-[680px]:top-[62px] max-[680px]:w-auto";
export const dropdownHead =
  "px-[14px] py-3 border-b border-[#eef0f4] flex justify-between items-center text-[12px] font-bold";
export const notifyItem =
  "px-[13px] py-[11px] border-b border-[#f2f3f6] flex gap-2 bg-white last:border-b-0";
export const notifyItemUnread = "bg-[#fbf9ff]";
export const notifyItemB = "text-[12px]";
export const notifyItemP = "text-[12px] text-[#838b9e] my-[3px]";
export const notifyItemTime = "text-[12px] text-[#adb2bf]";

export const empty = "p-[30px] text-center text-[#9aa0ae] text-[12px]";

export const kpiLine =
  "flex justify-between items-center py-[7px] border-b border-[#f1f2f5] text-[12px] last:border-b-0";
export const kpiLineB = "text-[12px]";

export const chartLegend = "flex gap-[10px] text-[12px] text-[#9198a8]";
export const legendDot = "w-[6px] h-[6px] rounded-full inline-block mr-[3px] bg-rc-purple";
export const legendDotCyan = "bg-[#14b6bf]";

export const money = "tabular-nums";
export const inlineActions = "flex gap-1";

export const modalBackdrop =
  "fixed inset-0 bg-[rgba(21,26,43,0.35)] grid place-items-center z-[100] p-4";
export const modal =
  "w-full max-w-[460px] bg-white rounded-[10px] p-[18px] shadow-[0_20px_60px_rgba(21,26,43,0.22)]";
export const modalH3 = "m-0 mb-3 text-[13px]";

export const toast = {
  base: "fixed right-5 bottom-5 z-[120] min-w-[240px] max-w-[360px] text-white rounded-lg px-[14px] py-[11px] shadow-[0_10px_30px_rgba(0,0,0,0.15)] text-[12px] cursor-pointer",
  default: "bg-[#202637]",
  success: "bg-[#168a61]",
  error: "bg-[#c44450]",
};
