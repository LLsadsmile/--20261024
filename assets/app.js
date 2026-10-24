/* ========== 技能互换 · 共享数据层与组件 ========== */
const CATS = ["音乐","编程","语言","运动","美术","生活","考证","其他"];
const AV_COLORS = ["#6C5CE7","#FD79A8","#00B8A9","#FF9F43","#0984e3","#e84393","#00cec9","#fdcb6e"];
const REPLY_LINES = ["收到！👍","好呀，那我们约个时间细聊～","没问题，随时可以开始 😄","哈哈可以，这个交换我喜欢！","OK，我这边有空，你定时间～"];

function load(k,def){try{const v=localStorage.getItem(k);return v?JSON.parse(v):def;}catch(e){return def;}}
function $(id){return document.getElementById(id);}
function esc(s){return (s==null?"":String(s)).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));}
function avColor(name){let s=0;for(const c of (name||""))s+=c.charCodeAt(0);return AV_COLORS[s%AV_COLORS.length];}
function nowTime(){const d=new Date();return String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0");}
function isPc(){return state.layout==="pc";}
function lastPreview(m){
  if(!m)return "（暂无消息）";
  if(m.type==="image")return "📷 [图片]";
  if(m.type==="post")return "📌 [帖子卡片]";
  return m.text;
}
function toast(msg){const t=$("toast");if(!t)return;t.textContent=msg;t.classList.add("show");clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove("show"),1800);}

function seedPosts(){
  return [
    {id:1,type:"learn",cat:"音乐",title:"零基础想学吉他弹唱",desc:"工作党，周末有空，想先学会《成都》《晴天》几首，愿意用Python帮做小工具交换。",mode:"线下",place:"北京·朝阳",reward:"帮你写自动化脚本",author:"小鹿",av:"🦌",time:"2小时前",likes:24,taken:false},
    {id:2,type:"teach",cat:"编程",title:"10年工程师教你Python",desc:"从环境搭建到爬虫/数据分析，可系统带，免费，只希望有人陪我练口语。",mode:"线上",place:"线上",reward:"求英语口语陪练",author:"老王",av:"🧑‍💻",time:"5小时前",likes:61,taken:false},
    {id:3,type:"learn",cat:"语言",title:"想练地道英语口语",desc:"雅思口语6分想冲7，希望找母语者或高手每周聊1次，可教中国菜做法。",mode:"线上",place:"线上",reward:"教做家常菜",author:"Mia",av:"🌸",time:"昨天",likes:38,taken:false},
    {id:4,type:"teach",cat:"美术",title:"美院毕业，教零基础画画",desc:"素描/水彩都可以，线下面授，想换一节健身私教或摄影跟拍。",mode:"线下",place:"上海·徐汇",reward:"求健身/摄影",author:"阿橙",av:"🍊",time:"昨天",likes:45,taken:false},
    {id:5,type:"learn",cat:"运动",title:"想学游泳，怕水星人",desc:"成年后才开始，需要耐心教练，可教PPT排版和汇报技巧。",mode:"线下",place:"广州·天河",reward:"教PPT美化",author:"豆豆",av:"🫘",time:"2天前",likes:19,taken:false},
    {id:6,type:"teach",cat:"生活",title:"手冲咖啡 & 烘焙教学",desc:"周末可约，从豆子到拉花，想换一节吉他入门或摄影。",mode:"线下",place:"成都·武侯",reward:"求吉他/摄影",author:"拿铁",av:"☕",time:"3天前",likes:52,taken:false},
    {id:7,type:"learn",cat:"考证",title:"备战教资，求搭子互相督促",desc:"一起打卡刷题，可教Excel和数据透视表。",mode:"线上",place:"线上",reward:"教Excel",author:"学酥",av:"📚",time:"3天前",likes:27,taken:false},
    {id:8,type:"teach",cat:"摄影",title:"婚礼跟拍经验，教人像构图",desc:"付费可免，想换一套UI设计或公众号排版。",mode:"线上",place:"线上",reward:"求UI/排版",author:"快门",av:"📷",time:"4天前",likes:33,taken:false},
  ];
}
function seedConvs(){
  return [
    {id:1,name:"小鹿",av:"🦌",unread:2,msgs:[
      {who:"them",type:"text",text:"你好！看到你发布的Python教学帖啦，特别感兴趣 😄",time:"10:20"},
      {who:"them",type:"text",text:"我可以教你吉他入门，你能带我用Python写个小爬虫吗？",time:"10:21"},
      {who:"me",type:"text",text:"没问题呀！周末线上就可以约第一节课～",time:"10:24"},
    ]},
    {id:2,name:"老王",av:"🧑‍💻",unread:0,msgs:[
      {who:"me",type:"text",text:"王老师好，想系统学一下数据分析方向",time:"昨天"},
      {who:"them",type:"text",text:"可以，先从环境搭建和pandas基础开始，你先装个Anaconda",time:"昨天"},
    ]},
  ];
}

const state = {
  user: load("sk_user",null),            // 登录态（跨页面保持）
  layout: load("sk_layout","mobile"),    // mobile | pc
  cat:"全部",
  publishType:"learn",
  publishCat:"音乐",
  profileTab:"msg",
  chatWith:null,
  quoting:null,
  search:""
};
let posts = load("sk_posts", seedPosts());
let drafts = load("sk_drafts", []);
let convs  = load("sk_convs", seedConvs());
let favs   = load("sk_favs", []);

function persist(){
  localStorage.setItem("sk_posts",JSON.stringify(posts));
  localStorage.setItem("sk_drafts",JSON.stringify(drafts));
  localStorage.setItem("sk_convs",JSON.stringify(convs));
  localStorage.setItem("sk_favs",JSON.stringify(favs));
  localStorage.setItem("sk_user",JSON.stringify(state.user));
}

/* ========== 布局切换（移动版 / PC版） ========== */
function applyLayout(){document.body.classList.toggle("pc",isPc());}
/* 跨页面跳转时携带布局状态（解决 file:// 下 localStorage 不共享导致退回移动版的问题） */
function withLayout(u){return u+(u.indexOf("?")>-1?"&":"?")+"layout="+encodeURIComponent(state.layout);}
function toggleLayout(){
  state.layout = isPc() ? "mobile" : "pc";
  try{localStorage.setItem("sk_layout",state.layout);}catch(e){}
  applyLayout();renderTop();renderNav();
  document.dispatchEvent(new CustomEvent("layoutchange"));
  toast(isPc()?"已切换为 PC 版布局 💻":"已切换为移动版布局 📱");
}

/* ========== 登录 ========== */
let loginMode="login";
function requireLogin(act){if(!state.user){openLogin();toast("请先登录后再"+act);return false;}return true;}
function openLogin(){
  $("loginMask").classList.add("show");
  $("codeField").style.display = loginMode==="reg" ? "block":"none";
  $("nickField").style.display = loginMode==="reg" ? "block":"none";
}
function closeLogin(){$("loginMask").classList.remove("show");}

/* ========== 弹窗注入（所有页面共用） ========== */
function injectModals(){
  if($("loginMask"))return;
  document.body.insertAdjacentHTML("beforeend",`
  <div class="modal-mask" id="loginMask">
    <div class="modal modal-wrap">
      <span class="close" data-close="loginMask">×</span>
      <h3>欢迎来到技能互换 👋</h3>
      <p class="sub">登录后即可发布需求、接单与私信</p>
      <div class="seg" id="loginSeg">
        <button class="on" data-seg="login">登录</button>
        <button data-seg="reg">注册</button>
      </div>
      <div class="field"><label>手机号</label><input id="lPhone" placeholder="请输入手机号" inputmode="numeric"/></div>
      <div class="field" id="codeField" style="display:none;"><label>验证码 / 密码</label><input id="lCode" placeholder="请输入密码（演示）"/></div>
      <div class="field" id="nickField" style="display:none;"><label>昵称（注册时填写）</label><input id="lNick" placeholder="给自己起个名字"/></div>
      <button class="btn btn-primary btn-block" id="loginSubmit">进入平台</button>
      <p class="sub" style="text-align:center;margin-top:12px;">演示原型 · 无需真实信息</p>
    </div>
  </div>
  <div class="modal-mask" id="detailMask">
    <div class="modal modal-wrap"><span class="close" data-close="detailMask">×</span><div id="detailContent"></div></div>
  </div>
  <div class="modal-mask" id="pickerMask">
    <div class="modal modal-wrap"><span class="close" data-close="pickerMask">×</span><h3>📌 发送我的帖子</h3><p class="sub">选择一条「我想学 / 我能教」帖发送给对方</p><div id="pickerList"></div></div>
  </div>
  <div class="toast" id="toast"></div>
  <input type="file" id="imgInput" accept="image/*" style="display:none"/>`);
  $("loginSeg").addEventListener("click",e=>{
    const b=e.target.closest("button");if(!b)return;
    loginMode=b.dataset.seg;
    [...$("loginSeg").children].forEach(x=>x.classList.toggle("on",x===b));
    $("codeField").style.display = loginMode==="reg"?"block":"none";
    $("nickField").style.display = loginMode==="reg"?"block":"none";
  });
  $("loginSubmit").onclick=()=>{
    const phone=$("lPhone").value.trim();
    const nick=$("lNick").value.trim()|| (loginMode==="reg"? "新用户":"我");
    if(!phone){toast("请输入手机号");return;}
    state.user={nick,phone,level:"Lv.1 互换新手",av:"🙂"};
    persist();closeLogin();location.reload();
  };
  $("imgInput").onchange=e=>{
    const f=e.target.files[0];if(!f)return;
    sendMsg({type:"image",src:URL.createObjectURL(f)});
    e.target.value="";
  };
}

/* ========== 顶部与导航 ========== */
const NAV=[
  {key:"home",   url:"首页.html",    icon:"🏠", label:"广场",   tabIcon:"🏠", tabLabel:"广场"},
  {key:"hot",    url:"热点榜.html",  icon:"🔥", label:"热点榜"},
  {key:"publish",url:"发布.html",    icon:"➕", label:"发布",   tabIcon:"➕", tabLabel:"发布"},
  {key:"profile",url:"个人中心.html",icon:"👤", label:"我的",   tabIcon:"👤", tabLabel:"我的"},
];
function renderTop(){
  const box=$("topRight");if(!box)return;
  if(state.user){
    box.innerHTML=`<button class="btn btn-ghost btn-sm" id="logoutBtn">👤 ${esc(state.user.nick)} · 退出</button>`;
    $("logoutBtn").onclick=()=>{state.user=null;persist();location.reload();};
  }else{
    box.innerHTML=`<button class="btn login-btn btn-sm" id="loginTopBtn">登录 / 注册</button>`;
    $("loginTopBtn").onclick=()=>openLogin();
  }
}
function renderNav(){
  const page=document.body.dataset.page||"";
  const nav=$("pcNav");
  if(nav)nav.innerHTML=NAV.map(n=>`<a href="${withLayout(n.url)}" class="${page===n.key?"on":""}">${n.icon} ${n.label}</a>`).join("");
  const tab=$("tabbar");
  if(tab)tab.innerHTML=NAV.filter(n=>n.tabIcon).map(n=>`<a href="${withLayout(n.url)}" class="${page===n.key?"on":""}"><span class="ico">${n.tabIcon}</span>${n.tabLabel}</a>`).join("");
}
function initPage(){
  /* 优先读取 URL 中携带的布局参数（兼容 file:// 下 localStorage 跨文件不共享） */
  const ul=new URLSearchParams(location.search).get("layout");
  if(ul==="pc"||ul==="mobile"){state.layout=ul;try{localStorage.setItem("sk_layout",ul);}catch(e){}}
  applyLayout();injectModals();renderTop();renderNav();
}

/* ========== 私信跳转（跨页面） ========== */
function openChatWith(name,av){
  let conv=convs.find(c=>c.name===name);
  if(!conv){conv={id:Date.now(),name,av,unread:0,msgs:[]};convs.unshift(conv);}
  localStorage.setItem("sk_chat_target",String(conv.id));
  persist();
  location.href=withLayout("个人中心.html");
}

/* ========== 帖子详情弹窗 ========== */
function openDetail(id){
  const p=posts.find(x=>x.id===id);if(!p)return;
  const isLearn=p.type==="learn";
  $("detailContent").innerHTML=`
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">
      <div class="detail-av" style="background:${avColor(p.author)}">${esc(p.av)}</div>
      <div><div style="font-weight:800;font-size:18px;">${esc(p.author)}</div><div style="color:var(--text-2);font-size:13px;">${esc(p.time)} · ${esc(p.place)}</div></div>
      <span class="badge ${p.type}" style="margin-left:auto;">${isLearn?"📚 我想学":"💡 我能教"}</span>
    </div>
    <h3 style="font-size:22px;margin-bottom:10px;">${esc(p.title)}</h3>
    <p style="font-size:16px;color:#444;margin-bottom:14px;line-height:1.7;">${esc(p.desc)}</p>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px;">
      <span class="pill">#${esc(p.cat)}</span><span class="pill">${esc(p.mode)}</span><span class="pill">🔁 ${esc(p.reward)}</span><span class="pill">❤️ ${p.likes}</span>
    </div>
    <div style="display:flex;gap:12px;margin-bottom:12px;">
      ${isLearn
        ? `<button class="btn btn-pink btn-block" id="dtTake">我教TA（接单）</button>`
        : `<button class="btn btn-teal btn-block" id="dtLearn">我想学（联系TA）</button>`}
    </div>
    <div style="display:flex;gap:12px;">
      <button class="btn btn-ghost btn-block" id="dtDm">💬 私信</button>
      <button class="btn btn-ghost btn-block" id="dtFav">${favs.includes(p.id)?"💛 已收藏":"⭐ 收藏"}</button>
    </div>`;
  $("detailMask").classList.add("show");
  const take=()=>{if(!requireLogin("接单"))return;p.taken=true;p.likes++;persist();closeDetail();refreshPage();toast("接单成功！已通知对方 🎉");};
  const learn=()=>{if(!requireLogin("联系"))return;toast("已发送学习意向，等待对方回复～");};
  const dm=()=>{if(!requireLogin("私信"))return;closeDetail();openChatWith(p.author,p.av);};
  const fav=()=>{
    if(!requireLogin("收藏"))return;
    const i=favs.indexOf(p.id);
    if(i>-1){favs.splice(i,1);toast("已取消收藏");}
    else{favs.push(p.id);toast("已加入收藏夹 ⭐");}
    persist();openDetail(p.id);
  };
  if($("dtTake"))$("dtTake").onclick=take;
  if($("dtLearn"))$("dtLearn").onclick=learn;
  $("dtDm").onclick=dm;
  $("dtFav").onclick=fav;
}
function closeDetail(){$("detailMask").classList.remove("show");}
/* 页面可覆盖：数据变化后刷新当前页 */
function refreshPage(){
  if(typeof renderSquare==="function")renderSquare();
  if(typeof renderRank==="function")renderRank();
}

/* ========== 私信：会话列表 + 聊天（个人中心页使用） ========== */
function renderMsgTab(){
  const layout=$("msgLayout");if(!layout)return;
  layout.classList.toggle("in-chat", !!state.chatWith && !isPc());
  $("msgListCol").innerHTML=`<div class="msg-list-head">💬 我的私信（${convs.length}）</div>` + (convs.length?convs.map(c=>{
    const last=c.msgs[c.msgs.length-1];
    return `
    <div class="msg-item" data-conv="${c.id}">
      <div class="m-av" style="background:${avColor(c.name)}">${esc(c.av)}</div>
      <div class="m-body"><div class="m-name">${esc(c.name)} ${c.unread?`<span style="color:var(--pink);font-size:12px;">●${c.unread}新</span>`:""}</div><div class="m-last">${esc(lastPreview(last))}</div></div>
      <div class="m-time">${esc(last?last.time:"")}</div>
    </div>`;}).join("")
    :`<div class="empty"><div class="ico">💬</div>还没有私信，去广场联系感兴趣的人吧</div>`);
  renderChat();
}
function renderChat(){
  const col=$("chatCol");if(!col)return;
  const conv=convs.find(c=>c.id===state.chatWith);
  if(!conv){
    col.innerHTML=isPc()?`<div class="chat-placeholder">👈 在左侧选择一个对话，开始聊天</div>`:"";
    return;
  }
  const bubbles=conv.msgs.map((m,i)=>{
    let inner="";
    if(m.quote)inner+=`<div class="quote-block">↩ ${esc(m.quote.name)}：${esc((m.quote.text||"").slice(0,40))}</div>`;
    if(m.type==="text")inner+=esc(m.text);
    if(m.type==="image")inner+=`<img src="${m.src}" alt="图片"/>`;
    if(m.type==="post"){
      const p=posts.find(x=>x.id===m.postId);
      inner+=(p
        ?`<div class="post-chip" data-open="${p.id}"><span class="badge ${p.type}" style="font-size:12px;padding:3px 9px;">${p.type==="learn"?"📚 我想学":"💡 我能教"}</span><div style="font-weight:800;margin-top:6px;color:var(--text);">${esc(p.title)}</div><div style="font-size:12px;color:var(--text-2);margin-top:4px;">点击查看帖子详情 ›</div></div>`
        :`<div class="post-chip">📌 该帖子已删除</div>`);
    }
    const qAttr=(m.who==="them"&&m.type==="text")?` data-q="${i}" title="点击引用这条消息"`:"";
    const cls=(m.who==="them"&&m.type==="text")?" clickable":"";
    return `<div class="bubble-row ${m.who}">
      ${m.who==="them"?`<div class="c-av" style="background:${avColor(conv.name)}">${esc(conv.av)}</div>`:""}
      <div class="bubble ${m.who}${cls}"${qAttr}>${inner}<div class="b-time">${esc(m.time)}</div></div>
    </div>`;
  }).join("");
  col.innerHTML=`
    <div class="chat-panel">
      <div class="chat-head">
        <button class="mini-btn pc-hide" data-chat-back>‹ 返回</button>
        <div class="c-av" style="background:${avColor(conv.name)}">${esc(conv.av)}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:800;">${esc(conv.name)}</div>
          <div style="font-size:12px;color:var(--text-2);">在线 · 技能互换用户</div>
        </div>
      </div>
      <div class="chat-body" id="chatBody">${bubbles||`<div class="empty" style="padding:24px;"><div class="ico">👋</div>开始你们的第一次对话吧</div>`}</div>
      <div class="chat-composer">
        <div class="quote-bar" id="quoteBar"></div>
        <div class="composer-row">
          <button class="icon-btn" id="btnImg" title="发送图片">🖼️</button>
          <button class="icon-btn" id="btnPost" title="发送我的帖子">📌</button>
          <input id="chatInput" placeholder="输入消息…（点击对方气泡可引用）"/>
          <button class="btn btn-primary btn-sm" id="chatSend">发送</button>
        </div>
      </div>
    </div>`;
  const input=$("chatInput");
  const sendText=()=>{
    const v=input.value.trim();
    if(!v){toast("先输入内容再发送哦");return;}
    const q=state.quoting;state.quoting=null;
    sendMsg({type:"text",text:v,quote:q});
  };
  $("chatSend").onclick=sendText;
  input.addEventListener("keydown",e=>{if(e.key==="Enter")sendText();});
  $("btnImg").onclick=()=>$("imgInput").click();
  $("btnPost").onclick=openPostPicker;
  updateQuoteBar();
  const body=$("chatBody");body.scrollTop=body.scrollHeight;
}
function updateQuoteBar(){
  const bar=$("quoteBar");if(!bar)return;
  if(state.quoting){
    bar.style.display="flex";
    bar.innerHTML=`<span class="qb-text">↩ 引用 ${esc(state.quoting.name)}：${esc(state.quoting.text.slice(0,30))}</span><button class="qb-x" id="quoteCancel">✕</button>`;
    $("quoteCancel").onclick=()=>{state.quoting=null;updateQuoteBar();};
  }else{
    bar.style.display="none";bar.innerHTML="";
  }
}
function sendMsg(payload){
  if(!state.chatWith)return;
  const conv=convs.find(c=>c.id===state.chatWith);if(!conv)return;
  conv.msgs.push({who:"me",time:nowTime(),...payload});
  conv.unread=0;
  persist();renderChat();
  setTimeout(()=>{
    const c=convs.find(x=>x.id===conv.id);if(!c)return;
    const text=payload.type==="image"?"图片收到啦！😄":payload.type==="post"?"我看看你的帖子，很有意思！":"收到！👍";
    c.msgs.push({who:"them",type:"text",text,time:nowTime()});
    persist();
    if(state.chatWith===conv.id)renderChat();
  },900);
}
function openPostPicker(){
  if(!requireLogin("发送帖子"))return;
  const mine=posts.filter(p=>p.author===state.user.nick);
  $("pickerList").innerHTML=mine.length
    ? mine.map(p=>`
      <div class="list-card" data-sendpost="${p.id}" style="cursor:pointer;">
        <div class="lc-head"><span class="badge ${p.type}" style="font-size:12px;padding:3px 9px;">${p.type==="learn"?"📚 我想学":"💡 我能教"}</span><span class="lc-title">${esc(p.title)}</span></div>
        <div class="lc-desc">${esc(p.desc).slice(0,36)}…</div>
        <div class="lc-foot"><span class="pill">#${esc(p.cat)}</span><span class="pill">❤️ ${p.likes}</span><span style="color:var(--primary);font-weight:800;">点击发送 ›</span></div>
      </div>`).join("")
    : `<div class="empty"><div class="ico">📝</div>你还没有发布过帖子，先去「发布」页创建一帖吧</div>`;
  $("pickerMask").classList.add("show");
}

/* ========== 全局点击委托（所有页面共用） ========== */
document.addEventListener("click",e=>{
  const close=e.target.closest("[data-close]");
  if(close){$(close.dataset.close).classList.remove("show");return;}
  const chatBack=e.target.closest("[data-chat-back]");
  if(chatBack){state.chatWith=null;state.quoting=null;if(typeof renderMsgTab==="function")renderMsgTab();return;}
  const convEl=e.target.closest("[data-conv]");
  if(convEl){state.chatWith=Number(convEl.dataset.conv);state.quoting=null;const c=convs.find(x=>x.id===state.chatWith);if(c)c.unread=0;persist();if(typeof renderMsgTab==="function")renderMsgTab();return;}
  const qEl=e.target.closest("[data-q]");
  if(qEl&&state.chatWith){
    const conv=convs.find(x=>x.id===state.chatWith);
    const m=conv&&conv.msgs[Number(qEl.dataset.q)];
    if(m){state.quoting={name:conv.name,text:m.text};updateQuoteBar();$("chatInput")&&$("chatInput").focus();}
    return;
  }
  const sp=e.target.closest("[data-sendpost]");
  if(sp){$("pickerMask").classList.remove("show");sendMsg({type:"post",postId:Number(sp.dataset.sendpost)});return;}
  const uf=e.target.closest("[data-unfav]");
  if(uf){const id=Number(uf.dataset.unfav);const i=favs.indexOf(id);if(i>-1)favs.splice(i,1);persist();if(typeof renderProfileTab==="function")renderProfileTab();toast("已取消收藏");return;}
  const open=e.target.closest("[data-open]");
  if(open){openDetail(Number(open.dataset.open));return;}
  const take=e.target.closest("[data-take]");
  if(take){const p=posts.find(x=>x.id===Number(take.dataset.take));if(!requireLogin("接单"))return;p.taken=true;p.likes++;persist();refreshPage();toast("接单成功！已通知对方 🎉");return;}
  const learn=e.target.closest("[data-learn]");
  if(learn){if(!requireLogin("联系"))return;toast("已发送学习意向，等待对方回复～");return;}
  const dm=e.target.closest("[data-dm]");
  if(dm){if(!requireLogin("私信"))return;const p=posts.find(x=>x.id===Number(dm.dataset.dm));openChatWith(p.author,p.av);return;}
});
/* 点遮罩关闭 */
document.addEventListener("click",e=>{
  if(e.target.classList&&e.target.classList.contains("modal-mask"))e.target.classList.remove("show");
});

/* ========== 页面初始化 ========== */
initPage();
