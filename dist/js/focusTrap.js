(()=>{var s=class{constructor(e){this.rootEl=e}rootEl=null;_active=!1;firstFocusableElement=null;lastFocusableElement=null;get active(){return this._active}set active(e){typeof e=="boolean"&&(this._active=e,this._active?this.activate():this.deactivate())}activate(){if(!this._active)return;let e=Array.from(this.rootEl.querySelectorAll("a[href], button, textarea, input, select, summary, [tabindex]"));if(e.filter(t=>t.getAttribute("tabindex")!=="-1"),e.length===0)return;let l=e.filter(t=>t.offsetParent!==null);this.firstFocusableElement=l[0],this.lastFocusableElement=l[l.length-1],this.rootEl.addEventListener("keydown",t=>{t.key==="Tab"&&(!t.shiftKey&&document.activeElement===this.lastFocusableElement?(t.preventDefault(),this.firstFocusableElement.focus()):t.shiftKey&&document.activeElement===this.firstFocusableElement&&(t.preventDefault(),this.lastFocusableElement.focus()))})}deactivate(){this.rootEl.removeEventListener("keydown",()=>{}),this.firstFocusableElement=null,this.lastFocusableElement=null}},a=s;})();
//# sourceMappingURL=focusTrap.js.map
