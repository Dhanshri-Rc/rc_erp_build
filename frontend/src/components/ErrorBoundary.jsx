import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  componentDidCatch(error,info){console.error('RC ERP render failure',error,info);}
  render(){
    if(this.state.failed)return <main className="grid min-h-screen place-items-center bg-[#f8f9fc] p-6"><div className="rounded-lg border border-[#e7e9f1] bg-white p-8 text-center shadow-sm"><h1 className="text-lg font-semibold text-[#252b3c]">Something went wrong</h1><p className="mt-2 text-sm text-[#71798b]">Refresh the page. If the problem continues, contact your administrator.</p><button className="mt-5 rounded-md bg-[#6f4cf4] px-5 py-2 text-sm text-white" onClick={()=>window.location.reload()}>Refresh</button></div></main>;
    return this.props.children;
  }
}
