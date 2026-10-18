import { useEffect, useRef, type MouseEvent } from 'react';

export default function usePrototypeNavigation() {
  const saved = useRef<{x:number;y:number;token:string;popup:Window|null} | null>(null);
  useEffect(() => {
    const restore = () => {
      const previous = saved.current;
      const stored = sessionStorage.getItem('guardian-prototype-return');
      const position = previous ?? (stored ? JSON.parse(stored) : null);
      if (!position) return;
      window.scrollTo(position.x ?? 0, position.y ?? 0);
      document.getElementById('mr-prototype-entry')?.focus({preventScroll:true});
    };
    const returned = (event: MessageEvent) => {
      if (event.origin !== location.origin || event.data?.type !== 'guardian-prototype-exit' || event.data.token !== saved.current?.token) return;
      const expected = saved.current;
      if (!expected || (expected.popup && event.source !== expected.popup)) return;
      restore();
    };
    if (location.hash === '#mr-prototype-entry') {
      Promise.all(Array.from(document.querySelectorAll<HTMLImageElement>('.portfolio-image-page')).map(img=>img.decode().catch(()=>{}))).then(()=>{
        const stored=sessionStorage.getItem('guardian-prototype-return');
        if(stored) restore();
        else {document.getElementById('mr-prototype-entry')?.scrollIntoView({block:'center'});document.getElementById('mr-prototype-entry')?.focus({preventScroll:true});}
      });
    }
    window.addEventListener('message',returned);
    return ()=>window.removeEventListener('message',returned);
  },[]);
  return (event: MouseEvent<HTMLAnchorElement>) => {
    const token=crypto.randomUUID();
    const position={x:scrollX,y:scrollY,token,url:new URL('#mr-prototype-entry',location.href).href};
    sessionStorage.setItem('guardian-prototype-return',JSON.stringify(position));
    saved.current={...position,popup:null};
    if(event.button!==0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const popup=window.open(event.currentTarget.href,'_blank');
    saved.current.popup=popup;
    if(!popup) location.assign(event.currentTarget.href);
  };
}
