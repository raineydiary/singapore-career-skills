// Files stay in this browser. No model request or file upload is performed here.
export function readResume(file,{onProgress=()=>{},WorkerClass=globalThis.Worker,
  loadTimeout=60000,parseTimeout=20000,fileTimeout=15000}={}) {
  let worker,timer,settled=false,rejectPromise;
  const promise=new Promise((resolve,reject)=>{
    rejectPromise=reject;
    const finish=(error,text)=>{
      if(settled)return;
      settled=true;clearTimeout(timer);worker?.terminate();
      error?reject(error):resolve(text);
    };
    const stage=(message,timeout,error)=>{
      clearTimeout(timer);onProgress(message);
      timer=setTimeout(()=>finish(new Error(error)),timeout);
    };
    (async()=>{
      if(!/\.(pdf|docx?)$/i.test(file?.name||'')||file.size>5*1024*1024)
        throw new Error('请选择不超过 5 MB 的 PDF、DOC 或 DOCX 简历');
      stage('正在打开文件…',fileTimeout,'文件未能打开，请确认文件已下载到本机后重试');
      const buffer=await file.arrayBuffer();if(settled)return;
      stage('正在加载读取组件，首次打开可能稍慢…',loadTimeout,
        '读取组件加载超时，请检查网络后重新选择文件；原简历仍保留');
      worker=new WorkerClass(new URL('./vendor/parser-worker.20261020l.js',import.meta.url),{type:'module'});
      let sent=false;
      worker.onmessage=({data})=>{
        if(settled)return;
        if(data?.stage==='ready'&&!sent){
          sent=true;
          worker.postMessage({buffer,extension:file.name.split('.').pop().toLowerCase()},[buffer]);
        }else if(data?.stage==='pdf-loading'){
          stage('正在加载 PDF 读取组件…',loadTimeout,
            'PDF 读取组件加载超时，请检查网络后重试；原简历仍保留');
        }else if(data?.stage==='parsing'){
          stage('正在提取简历文字…',parseTimeout,
            '简历解析超时，原简历仍保留；可重新选择文件或直接粘贴正文');
        }else if(typeof data?.ok==='boolean'){
          if(!data.ok)return finish(new Error(data.message||'简历读取失败，原简历仍保留'));
          if(typeof data.text!=='string'||data.text.trim().length<30||data.text.length>18000)
            return finish(new Error('读取内容不完整，原简历仍保留'));
          finish(null,data.text.trim());
        }
      };
      worker.onerror=()=>finish(new Error('读取组件加载失败，请检查网络后重试；原简历仍保留'));
      worker.onmessageerror=()=>finish(new Error('读取组件通信失败，请重新选择文件；原简历仍保留'));
    })().catch(error=>finish(error));
  });
  return {promise,terminate(){
    if(settled)return;
    settled=true;clearTimeout(timer);worker?.terminate();
    rejectPromise(new DOMException('已取消读取，原简历仍保留','AbortError'));
  }};
}
