export async function GET() {
  const script = `(function(){
  var s=document.currentScript;
  var slug=s.getAttribute('data-notebook');
  var base=s.getAttribute('data-url')||window.location.origin;
  if(!slug)return;
  var iframe=document.createElement('iframe');
  iframe.src=base+'/embed/'+slug;
  iframe.width='100%';
  iframe.height=s.getAttribute('data-height')||'600';
  iframe.frameBorder='0';
  iframe.style.border='none';
  iframe.style.borderRadius='8px';
  s.parentNode.insertBefore(iframe,s.nextSibling);
})();`;

  return new Response(script, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
