(this["webpackJsonpreact-interactive-demo"]=this["webpackJsonpreact-interactive-demo"]||[]).push([[0],{42:function(e,t,o){},43:function(e,t,o){"use strict";o.r(t),o.d(t,"Index",(function(){return st}));var r=o(0),n=o(23),c=o.n(n),s=o(9),i=o(4),a=o(24);const l=Object(a.a)({theme:{colors:{pageBackground:"rgb(240,240,240)",backgroundContrast:"rgb(216,216,216)",highContrast:"rgb(0,0,0)",lowContrast:"rgb(128,128,128)",formElementsBackground:"rgb(250,250,250)",red:"hsl(0,100%,50%)",orange:"hsl(30,100%,50%)",yellow:"hsl(51,100%,40%)",green:"hsl(120,100%,30%)",outlineGreen:"hsl(120,40%,55%)",blue:"hsl(240,100%,50%)",outlineBlue:"hsl(240,100%,70%)",purple:"hsl(270,100%,60%)",backgroundPurple:"hsl(270,100%,92%)"}}}),{styled:d,theme:h,keyframes:b,global:p}=l,x=h({colors:{pageBackground:"rgb(32,32,32)",backgroundContrast:"rgb(64,64,64)",highContrast:"rgb(192,192,192)",lowContrast:"rgb(136,136,136)",formElementsBackground:"rgb(20,20,20)",red:"hsl(0,100%,50%)",orange:"hsl(30,90%,50%)",yellow:"hsl(60,88%,50%)",green:"hsl(120,85%,42%)",outlineGreen:"hsl(120,80%,30%)",blue:"hsl(210,100%,60%)",outlineBlue:"hsl(210,80%,40%)",purple:"hsl(270,85%,60%)",backgroundPurple:"hsl(270,100%,15%)"}}),u=p({"button, input, select, textarea, a, area":{all:"unset"},"*, *::before, *::after, button, input, select, textarea, a, area":{margin:0,border:0,padding:0,boxSizing:"inherit",font:"inherit",fontWeight:"inherit",textDecoration:"inherit",textAlign:"inherit",lineHeight:"inherit",wordBreak:"inherit",color:"inherit",background:"transparent",WebkitTapHighlightColor:"transparent"},body:{color:"$highContrast",fontFamily:"system-ui, Helvetica Neue, sans-serif",wordBreak:"break-word",WebkitFontSmoothing:"antialiased",MozOsxFontSmoothing:"grayscale",fontSize:"16px",boxSizing:"border-box",textSizeAdjust:"none"},code:{fontFamily:"monospace",lineHeight:"16px"},"body, html":{height:"100%"},"#root":{minHeight:"100%",backgroundColor:"$pageBackground"}});var j=o(18),g=o(2),m=o(11),f=o(10),v=o(14),O=o(7);const $=d("div",{margin:"20px 0",paddingBottom:"30px",borderBottom:"1px dotted $lowContrast"}),y=d("h2",{fontSize:"22px",marginBottom:"10px"});var C=o(1);const k=d("div",{height:"200px",padding:"0 5px",border:"1px solid $highContrast",overflowY:"scroll",fontFamily:"monospace",outline:"none","&.focusFromKey":{outline:"3px solid $colors$purple",outlineOffset:"1px"}}),S=d((e=>Object(C.jsx)(g.a,{...e,as:"button"})),{fontFamily:"monospace",fontSize:"20px",textAlign:"center",width:"100%",minHeight:"50px",border:"1px solid",marginBottom:"5px","&.hover":{color:"$green"},"&.mouseActive":{color:"$green"},"&.touchActive":{color:"$blue"},"&.keyActive":{color:"$purple"},"&.focusFromTouch":{outline:"3px solid $colors$outlineBlue",outlineOffset:"1px"},"&.focusFromMouse":{outline:"3px solid $colors$outlineGreen",outlineOffset:"1px"},"&.focusFromKey":{outline:"3px solid $colors$purple",outlineOffset:"1px"}}),w={"hover: true":"green","hover: false":"normal","active: mouseActive":"green","active: touchActive":"blue","active: keyActive":"purple","active: false":"normal","focus: focusFromMouse":"green","focus: focusFromTouch":"blue","focus: focusFromKey":"purple","focus: false":"normal"},A=d("span",{color:"$lowContrast",variants:{type:{normal:{color:"$lowContrast"},green:{color:"$green"},blue:{color:"$blue"},purple:{color:"$purple"},orange:{color:"$orange"}}}}),F=d("div",{marginTop:"10px"}),R=d(Object(g.b)(v.a),{cursor:"pointer",fontSize:"18px",display:"inline-flex",alignItems:"center",verticalAlign:"top","&.hover>button, &.mouseActive>button":{color:"$green",borderColor:"$green",boxShadow:"0 0 0 1px $colors$green"},"&.touchActive>button":{color:"$blue",borderColor:"$blue",boxShadow:"0 0 0 1px $colors$blue"},"&.disabled":{opacity:.5,cursor:"unset"},"&>input":{display:"none"}}),B=d(Object(g.b)(f.b),{flexShrink:0,marginRight:"4px",appearance:"none",border:"1px solid $highContrast",width:"32px",height:"32px",borderRadius:"2px","&.focusFromKey":{outline:"none",borderColor:"$purple !important",boxShadow:"0 0 0 1px $colors$purple !important"},"&.keyActive":{color:"$purple"}}),I=d("code",{backgroundColor:"$backgroundContrast",marginTop:"2px",padding:"4px 6px 4px",borderRadius:"5px"}),W=()=>{const[e,t]=r.useState([]),[o,n]=r.useState(!1),c=r.useRef(null);r.useEffect((()=>{c.current&&(c.current.scrollTop=c.current.scrollHeight)}),[e]);const s=r.useCallback((({state:e,prevState:o})=>{t((t=>{const r=[...t];return e.hover!==o.hover&&r.push("hover: ".concat(e.hover)),e.active!==o.active&&r.push("active: ".concat(e.active)),e.focus!==o.focus&&r.push("focus: ".concat(e.focus)),r}))}),[]),i=r.useCallback((e=>{t((t=>[...t,"click eventFrom ".concat(Object(m.a)(e))]))}),[]),a=r.useCallback((e=>{t((t=>[...t,"double click eventFrom ".concat(Object(m.a)(e))]))}),[]),l=r.useCallback((({hover:e,active:t,focus:o})=>{const r=[];return e&&r.push("hover"),t&&r.push(t),o&&r.push(o),0===r.length&&r.push("normal"),r.join(", ")}),[]);return Object(C.jsxs)($,{id:"interactive-state-log",children:[Object(C.jsx)(y,{children:"Interactive State Log"}),Object(C.jsx)(S,{onStateChange:s,onClick:i,onDoubleClick:a,useExtendedTouchActive:o,children:l}),Object(C.jsx)(g.a,{as:k,ref:c,tabIndex:0,children:e.map(((e,t)=>Object(C.jsxs)("div",{children:[Object(C.jsx)(A,{children:t+1})," ",Object(C.jsx)(A,{type:/click/.test(e)?"orange":w[e],children:e})]},t)))}),"mouseOnly"!==j.a?Object(C.jsx)(F,{children:Object(C.jsxs)(R,{children:[Object(C.jsx)(B,{checked:o,onCheckedChange:e=>n(e.target.checked),children:Object(C.jsx)(f.a,{as:O.a,width:"30",height:"30"})}),Object(C.jsx)(I,{children:"useExtendedTouchActive"})]})}):null]})},E=d(y,{marginBottom:0}),D=d("div",{fontSize:18,height:52,marginBottom:4,display:"flex",alignItems:"center",justifyContent:"center","&>*":{textAlign:"center"},variants:{showInfo:{false:{color:"$lowContrast"}}}}),T=d("div",{textAlign:"center"}),K=d(g.a.Span,{height:30,display:"inline-block",verticalAlign:"top",outline:"none",borderRadius:"50%","&.hover":{color:"$green"},"&.touchActive":{color:"$blue"},"&.focusFromKey":{color:"$purple"}}),P=()=>{const[e,t]=r.useState(!1),o=r.useCallback((({state:e})=>{t(e.hover||"touchActive"===e.active||"focusFromKey"===e.focus)}),[]);return Object(C.jsxs)($,{id:"show-on",children:[Object(C.jsx)(E,{children:"Show On"}),Object(C.jsx)(D,{showInfo:e,children:Object(C.jsx)("span",{children:e?"Some info to show about something":Object(C.jsxs)(C.Fragment,{children:[Object(C.jsx)("code",{children:"hover"}),", ",Object(C.jsx)("code",{children:"touchActive"}),", and"," ",Object(C.jsx)("code",{children:"focusFromKey"})]})})}),Object(C.jsx)(T,{children:Object(C.jsx)(K,{onStateChange:o,useExtendedTouchActive:!0,tabIndex:0,children:Object(C.jsx)(O.c,{width:30,height:30})})})]})},M=d(g.a.A,{color:"$highContrast",textDecorationLine:"underline",textDecorationStyle:"dotted",textDecorationColor:"$green",textDecorationThickness:"from-font","&.hover":{textDecorationColor:"$green",textDecorationStyle:"solid"},"&.touchActive":{textDecorationColor:"$blue",textDecorationStyle:"solid"},"&.keyActive":{textDecorationColor:"$purple",textDecorationStyle:"solid"},variants:{focus:{outline:{"&.focusFromKey":{outline:"2px solid $colors$purple",outlineOffset:"2px"}},boxShadow:{padding:"2px 3px",margin:"-2px -3px",borderRadius:"3px","&.focusFromKey":{boxShadow:"0 0 0 2px $colors$purple"}}}},defaultVariants:{focus:"boxShadow"}}),z=({newWindow:e=!0,...t})=>Object(C.jsx)(M,{...t,target:e?"_blank":void 0,rel:e?"noopener noreferrer":void 0}),N=b({"0%":{transform:"scale(1)"},"50%":{transform:"scale(1.03)"},"100%":{transform:"scale(1)"}}),L={display:"inline-block",textDecoration:"underline",borderRadius:"3px",padding:"3px 4px 2px",margin:"1px -4px","&.hover, &.mouseActive":{color:"$green"},"&.touchActive":{color:"$blue"},"&.keyActive":{color:"$purple"},"&.focusFromKey":{animation:"".concat(N," 500ms"),textDecoration:"none",backgroundColor:"$backgroundPurple",boxShadow:"0 0 0 1px $colors$purple"}},H=d(g.a.A,L),U=d(Object(g.b)(s.b),L),G=d("p",{marginTop:"10px"}),J=()=>Object(C.jsxs)($,{id:"links",children:[Object(C.jsx)(y,{children:"Links"}),Object(C.jsxs)(H,{href:"#",children:["Anchor tag link \u2013 ",Object(C.jsx)("code",{children:'as="a" href="#"'})]}),Object(C.jsxs)(U,{to:"/",children:["React Router link \u2013 ",Object(C.jsx)("code",{children:'as={Link} to="/"'})]}),Object(C.jsxs)(G,{children:["Another"," ",Object(C.jsx)(z,{href:"#",newWindow:!1,children:"link with different styling"})," ","that appears in the middle of some text."]})]}),V=d(g.a.Input,{display:"block",width:"100%",margin:"8px 0",backgroundColor:"$formElementsBackground",border:"1px solid $colors$highContrast",borderRadius:"4px",padding:"4px 6px","&.hover, &.mouseActive":{borderColor:"$green"},"&.touchActive":{borderColor:"$blue",boxShadow:"0 0 0 1px $colors$blue"},"&.focusFromTouch":{borderColor:"$blue",boxShadow:"0 0 0 1px $colors$blue"},"&.focusFromMouse":{borderColor:"$green",boxShadow:"0 0 0 1px $colors$green"},"&.focusFromKey":{borderColor:"$purple",boxShadow:"0 0 0 1px $colors$purple, 2px 3px 4px 0px rgba(0, 0, 0, 0.38)"},"&.disabled":{opacity:.5}}),_=d(Object(g.b)(v.a),{cursor:"pointer",margin:"6px 1px",display:"inline-flex",alignItems:"center",lineHeight:"17px",verticalAlign:"top","&.hover>button":{color:"$green",borderColor:"$green",backgroundColor:"$formElementsBackground"},"&.mouseActive>button":{boxShadow:"0 0 0 1px $colors$green"},"&.touchActive>button":{color:"$blue",borderColor:"$blue",boxShadow:"0 0 0 1px $colors$blue"},"&.disabled":{opacity:.5,cursor:"unset"},"&>input":{display:"none"}}),Y=d(Object(g.b)(f.b),{width:"17px",height:"17px",flexShrink:0,marginRight:"4px",backgroundColor:"$formElementsBackground",border:"1px solid $highContrast",borderRadius:"2px","&.focusFromKey":{borderColor:"$purple !important",boxShadow:"0 0 0 1px $colors$purple, 2px 3px 4px 0px rgba(0, 0, 0, 0.38) !important"},"&.keyActive":{color:"$purple",boxShadow:"0 0 0 1px $colors$purple, 1px 2px 3px 0px rgba(0, 0, 0, 0.38) !important"}}),q=d("div",{display:"grid",gridTemplateAreas:'"select"',alignItems:"center",margin:"8px 0","&::after":{content:"",gridArea:"select",justifySelf:"end",width:"14px",height:"8px",marginRight:"8px",backgroundColor:"$highContrast",clipPath:"polygon(100% 0%, 50% 35%, 0 0%, 50% 100%)",pointerEvents:"none"},variants:{disabled:{true:{opacity:.5}}}}),Q=d(g.a.Select,{gridArea:"select",width:"100%",backgroundColor:"$formElementsBackground",border:"1px solid $colors$highContrast",borderRadius:"4px",padding:"4px 24px 4px 6px","&.hover":{borderColor:"$green"},"&.mouseActive":{boxShadow:"0 0 0 1px $colors$green"},"&.touchActive":{borderColor:"$blue",boxShadow:"0 0 0 1px $colors$blue"},"&.focusFromKey":{borderColor:"$purple",boxShadow:"0 0 0 1px $colors$purple, 2px 3px 4px 0px rgba(0, 0, 0, 0.38)"},"&.disabled":{opacity:.5},"&>option":{color:"$highContrast",background:"$colors$pageBackground"}}),X=d(g.a.Button,{display:"block",padding:"8px 26px",margin:"18px 0 14px",textAlign:"center",backgroundColor:"$formElementsBackground",border:"1px solid",borderRadius:"1000px","&.hover":{borderColor:"$green",boxShadow:"2px 3px 3px 0px rgba(0, 0, 0, 0.38)"},"&.focusFromKey":{borderColor:"$purple",boxShadow:"0 0 0 1px $colors$purple, 2px 3px 4px 0px rgba(0, 0, 0, 0.38)"},"&.mouseActive":{color:"$green",borderColor:"$green",boxShadow:"0 0 0 1px $colors$green, 1px 2px 3px 0px rgba(0, 0, 0, 0.38)"},"&.touchActive":{color:"$blue",borderColor:"$blue",boxShadow:"0 0 0 1px $colors$blue, 2px 3px 4px 0px rgba(0, 0, 0, 0.38)"},"&.keyActive":{color:"$purple",borderColor:"$purple",boxShadow:"0 0 0 1px $colors$purple, 1px 2px 3px 0px rgba(0, 0, 0, 0.38)"},"&.disabled":{opacity:.5}}),Z=d("div",{position:"fixed",top:0,bottom:0,left:0,right:0,backgroundColor:"royalblue",opacity:.2,pointerEvents:"none"}),ee=d(g.a.Button,{position:"fixed",fontSize:"9vmin",lineHeight:"7vmin","&.focusFromKey":{filter:"drop-shadow(6px 6px 3px royalblue) hue-rotate(50deg)"}}),te=e=>({id:e,top:Math.floor(81*Math.random()),left:Math.floor(91*Math.random())}),oe=()=>{const[e,t]=r.useState(""),[o,n]=r.useState(""),[c,s]=r.useState(!1),[i,a]=r.useState(!1),[l,d]=r.useState("placeholder"),[h,b]=r.useState(!1);h&&(""!==e&&t(""),c&&s(!1),i&&a(!1),"placeholder"!==l&&d("placeholder"));const[p,x]=r.useState([]),u=r.useCallback((()=>{const e=Array(10).fill(1).map(((e,t)=>te(t)));x(e)}),[]);return r.useEffect((()=>{if(1===p.length){x((e=>[te(e[0].id)]));const e=window.setInterval((()=>{x((e=>[te(e[0].id)]))}),"touch"===j.b?700:1e3);return()=>window.clearInterval(e)}}),[p.length]),Object(C.jsxs)($,{id:"form-elements",children:[Object(C.jsx)(y,{children:"Form Elements"}),Object(C.jsx)(V,{type:"text",value:e,disabled:h,onChange:e=>t(e.target.value),onStateChange:({state:e})=>{let t="";e.focus?t="This has focus for typing":h&&(e.hover||e.active)&&(t="Un-disable form elements to use this text input"),n(t)},placeholder:o}),Object(C.jsxs)(_,{disabled:h,children:[Object(C.jsx)(Y,{disabled:h,checked:c,onCheckedChange:e=>s(e.target.checked),children:Object(C.jsx)(f.a,{as:O.a,width:"15",height:"15"})}),"A checkbox for checking"]}),Object(C.jsxs)(_,{disabled:h,children:[Object(C.jsx)(Y,{disabled:h,checked:i,onCheckedChange:e=>a(e.target.checked),children:Object(C.jsx)(f.a,{as:O.a,width:"15",height:"15"})}),"Another checkbox for double checking"]}),Object(C.jsx)(q,{disabled:h,children:Object(C.jsxs)(Q,{disabled:h,value:l,onChange:e=>{d(e.target.value),"fishes"===e.target.value&&u()},onMouseDown:e=>{e.target.value&&d(e.target.value)},children:[Object(C.jsx)("option",{value:"placeholder",disabled:!0,hidden:!0,children:"Select your favorite type of checking"}),Object(C.jsx)("option",{value:"interest",children:"Interest checking"}),Object(C.jsx)("option",{value:"hockey",children:"Hockey checking"}),Object(C.jsx)("option",{value:"todo",children:"Checking off a todo item"}),Object(C.jsx)("option",{value:"double",children:"Double checking everything"}),Object(C.jsx)("option",{value:"fishes",children:"Checking for fish \ud83d\udc1f\ud83d\udc1f\ud83d\udc1f\ud83d\udc07"})]})}),p.length>0?Object(C.jsxs)(C.Fragment,{children:[Object(C.jsx)(Z,{}),p.map(((e,t,o)=>Object(C.jsx)(ee,{css:{top:"".concat(e.top,"vh"),left:"".concat(e.left,"vw")},onClick:()=>{x(o.filter((t=>t.id!==e.id)))},children:"\ud83d\udc1f"},e.id)))]}):null,Object(C.jsx)(X,{disabled:h,children:"Button"}),Object(C.jsxs)(_,{css:{marginBottom:0},children:[Object(C.jsx)(Y,{onCheckedChange:e=>b(e.target.checked),children:Object(C.jsx)(f.a,{as:O.a,width:"15",height:"15"})}),"Disable form elements"]})]})},re=d("button",{display:"block",padding:"8px 20px",marginTop:"18px",textAlign:"center",backgroundColor:"$formElementsBackground",border:"1px solid",borderRadius:"1000px",outline:"revert","&:hover":{color:"$green",borderColor:"$green"},"&:active":{color:"$red",borderColor:"$red"}}),ne=d(g.a.Button,{display:"block",padding:"8px 20px",marginTop:"18px",textAlign:"center",backgroundColor:"$formElementsBackground",border:"1px solid",borderRadius:"1000px","&.hover":{color:"$green",borderColor:"$green"},"&.active":{color:"$red",borderColor:"$red"},"&.focusFromKey":{borderColor:"$purple",boxShadow:"0 0 0 1px $colors$purple, 2px 3px 4px 0px rgba(0, 0, 0, 0.38)"}}),ce=d("div",{display:"flex",gap:"15px",marginTop:"15px"}),se=()=>Object(C.jsxs)($,{id:"css-sticky-hover-bug",children:[Object(C.jsx)(y,{children:"CSS Sticky Hover Bug"}),Object(C.jsxs)("p",{children:["On touch devices the CSS ",Object(C.jsx)("code",{children:":hover"})," state sticks until you tap someplace else on the screen."]}),Object(C.jsxs)(ce,{children:[Object(C.jsxs)("div",{children:[Object(C.jsxs)("p",{children:["Button styled with CSS, ",Object(C.jsx)("code",{children:":hover"})," is green,"," ",Object(C.jsx)("code",{children:":active"})," is red."]}),Object(C.jsx)(re,{children:"CSS Button"})]}),Object(C.jsxs)("div",{children:[Object(C.jsxs)("p",{children:["Button styled with React Interactive, ",Object(C.jsx)("code",{children:".hover"})," is green,"," ",Object(C.jsx)("code",{children:".active"})," is red."]}),Object(C.jsx)(ne,{useExtendedTouchActive:!0,children:"Interactive Button"})]})]})]}),ie=d("div",{variants:{stressTestShown:{true:{marginBottom:10}}}}),ae=d(y,{display:"inline-block",marginBottom:0,marginRight:8}),le=d(g.a.Button,{display:"inline-block",textDecoration:"underline",borderRadius:"3px",padding:"3px 4px 2px",marginLeft:"3px","&.hover, &.mouseActive":{color:"$green"},"&.touchActive":{color:"$blue"},"&.keyActive":{color:"$purple"},"&.focusFromKey":{textDecoration:"none",backgroundColor:"$backgroundPurple",boxShadow:"0 0 0 1px $colors$purple"}}),de=d(g.a.Button,{display:"block",width:"100%",fontFamily:"monospace","&.hover, &.mouseActive":{color:"$green"},"&.touchActive":{color:"$blue"},"&.keyActive":{color:"$purple"},"&.focusFromKey":{outline:"2px solid $colors$purple"}}),he=Array(500).fill(1).map(((e,t)=>Object(C.jsx)(de,{useExtendedTouchActive:!0,children:({hover:e,active:o})=>"Interactive button ".concat(t+1).concat(e||o?" - ":"").concat(e?"hover":"").concat(e&&o?", ":"").concat(o||"")},t))),be=()=>{const[e,t]=r.useState(!1);return Object(C.jsxs)($,{children:[Object(C.jsxs)(ie,{id:"stress-test",stressTestShown:e,children:[Object(C.jsx)(ae,{children:"Stress Test"}),"\u2013",Object(C.jsxs)(le,{onClick:()=>t((e=>!e)),children:["".concat(e?"remove":"create")," 500 Interactive buttons"]})]}),e?he:null]})},pe=d(g.a.Button,{color:"$highContrast",outline:"none","&.hover, &.mouseActive":{color:"$green",borderColor:"$green"},"&.touchActive":{color:"$blue",borderColor:"$blue"},"&.keyActive":{color:"$purple",borderColor:"$purple"},variants:{focus:{outline:{"&.focusFromKey":{outline:"2px solid $colors$purple",outlineOffset:"2px"}},boxShadow:{"&.focusFromKey":{boxShadow:"0 0 0 2px $colors$purple"}}}},defaultVariants:{focus:"outline"}}),xe=({newWindow:e=!0,css:t,...o})=>Object(C.jsx)(pe,{...o,as:g.a.A,target:e?"_blank":void 0,rel:e?"noopener noreferrer":void 0,focus:"boxShadow",css:{display:"inline-block",width:"36px",height:"36px",padding:"3px",borderRadius:"50%",...t},children:Object(C.jsx)(O.b,{width:"30",height:"30",style:{transform:"scale(1.1278)"}})});var ue=o(26);const je=({css:e,...t})=>{let o=null;try{o=localStorage}catch{}const n=Object(ue.a)(void 0,{classNameDark:x,storageProvider:o});return r.useEffect((()=>{!0===n.value?document.documentElement.style.colorScheme="dark":document.documentElement.style.colorScheme="light"}),[n.value]),Object(C.jsx)(pe,{...t,onClick:n.toggle,focus:"boxShadow",css:{width:"36px",height:"36px",padding:"3px",borderRadius:"50%",...e},"aria-label":"Toggle dark mode",children:Object(C.jsx)(O.d,{width:"30",height:"30"})})},ge=d("div",{maxWidth:"500px",padding:"10px 15px 25px",margin:"0 auto"}),me=d("header",{display:"flex",justifyContent:"space-between",marginBottom:"20px"}),fe=d("h1",{display:"flex",alignItems:"center",fontSize:"26px",marginRight:"10px"}),ve=d("span",{width:"80px",display:"inline-flex",justifyContent:"space-between"}),Oe=()=>Object(C.jsxs)(ge,{children:[Object(C.jsxs)(me,{children:[Object(C.jsx)(fe,{children:"React Interactive Demo"}),Object(C.jsxs)(ve,{children:[Object(C.jsx)(xe,{"aria-label":"GitHub repository for React Interactive",href:"https://github.com/rafgraph/react-interactive"}),Object(C.jsx)(je,{})]})]}),Object(C.jsx)($,{as:"p",css:{paddingBottom:"20px"},children:"Try out this demo on both mouse and touch devices, and test the keyboard navigation too!"}),Object(C.jsx)(W,{}),Object(C.jsx)(P,{}),Object(C.jsx)(J,{}),Object(C.jsx)(oe,{}),Object(C.jsx)(se,{}),Object(C.jsx)(be,{})]});o(42);const $e=d("div",{fontSize:"14px",opacity:.5}),ye=({state:{hover:e,active:t,focus:o},disabled:r})=>Object(C.jsxs)($e,{children:["hover: ",Object(C.jsx)("code",{children:"".concat(e)}),", active: ",Object(C.jsx)("code",{children:"".concat(t)}),", focus:"," ",Object(C.jsx)("code",{children:"".concat(o)}),", disabled: ",Object(C.jsx)("code",{children:"".concat(r)})]}),Ce=r.forwardRef(((e,t)=>Object(C.jsx)("button",{...e,ref:t}))),ke=r.forwardRef(((e,t)=>Object(C.jsx)("a",{...e,ref:t}))),Se=r.forwardRef(((e,t)=>Object(C.jsx)("div",{...e,ref:t,tabIndex:0}))),we=d("div",{padding:"20px",margin:"0 auto",maxWidth:"600px"}),Ae=d("h1",{fontSize:"20px",margin:"10px 0"}),Fe=d("div",{margin:"20px 0"}),Re={hover:!1,active:!1,focus:!1},Be=()=>{const[e,t]=r.useState(Re),[o,n]=r.useState(!1),[c,s]=r.useState(Re),[i,a]=r.useState(!1),[l,d]=r.useState(Re),[h,b]=r.useState(!1),[p,x]=r.useState(Re),[u,j]=r.useState(!1),[m,f]=r.useState(Re),[v,O]=r.useState(!1),[$,y]=r.useState(Re),[k,S]=r.useState(!1);return Object(C.jsxs)(we,{children:[Object(C.jsx)(Ae,{children:"Clicking the button/link/div disables it"}),Object(C.jsxs)("p",{children:["Check for edge cases related to"," ",Object(C.jsx)(z,{href:"https://github.com/facebook/react/issues/9142",children:"this React bug"}),", which is fixed/worked around in React Interactive."]}),Object(C.jsxs)(Fe,{children:[Object(C.jsx)(g.a,{as:"button",disabled:o,onClick:()=>n(!0),onStateChange:({state:e})=>t(e),className:"DisabledEdgeCase-button",children:Object(C.jsx)("code",{children:'as="button"'})}),Object(C.jsx)(ye,{state:e,disabled:o})]}),Object(C.jsxs)(Fe,{children:[Object(C.jsx)(g.a,{as:"a",href:"#top",disabled:i,onClick:()=>a(!0),onStateChange:({state:e})=>s(e),className:"DisabledEdgeCase-link",children:Object(C.jsx)("code",{children:'as="a" href="#top"'})}),Object(C.jsx)(ye,{state:c,disabled:i})]}),Object(C.jsxs)(Fe,{children:[Object(C.jsx)(g.a,{as:"div",tabIndex:0,disabled:h,onClick:()=>b(!0),onStateChange:({state:e})=>d(e),className:"DisabledEdgeCase-button",children:Object(C.jsx)("code",{children:'as="div" tabIndex=0'})}),Object(C.jsx)(ye,{state:l,disabled:h})]}),Object(C.jsxs)(Fe,{children:[Object(C.jsx)(g.a,{as:Ce,disabled:u,onClick:()=>j(!0),onStateChange:({state:e})=>x(e),className:"DisabledEdgeCase-button",children:Object(C.jsx)("code",{children:"as={ButtonComponent}"})}),Object(C.jsx)(ye,{state:p,disabled:u})]}),Object(C.jsxs)(Fe,{children:[Object(C.jsx)(g.a,{as:ke,href:"#top",disabled:v,onClick:()=>O(!0),onStateChange:({state:e})=>f(e),className:"DisabledEdgeCase-link",children:Object(C.jsx)("code",{children:'as={LinkComponent} href="#top"'})}),Object(C.jsx)(ye,{state:m,disabled:v})]}),Object(C.jsxs)(Fe,{children:[Object(C.jsx)(g.a,{as:Se,disabled:k,onClick:()=>S(!0),onStateChange:({state:e})=>y(e),className:"DisabledEdgeCase-button",children:Object(C.jsx)("code",{children:"as={DivComponent}"})}),Object(C.jsx)(ye,{state:$,disabled:k})]}),Object(C.jsx)(g.a,{as:"button",onClick:()=>{n(!0),a(!0),b(!0),j(!0),O(!0),S(!0)},className:"DisabledEdgeCase-button",children:"Disable all"}),Object(C.jsx)(g.a,{as:"button",onClick:()=>{n(!1),a(!1),b(!1),j(!1),O(!1),S(!1)},className:"DisabledEdgeCase-button",children:"Un-disable all"})]})},Ie=d("div",{padding:"20px",margin:"0 auto",maxWidth:"600px"}),We=d("h1",{fontSize:"20px",margin:"10px 0"}),Ee=d("div",{margin:"20px 0 5px"}),De={"&.hover, &.mouseActive":{color:"$green"},"&.touchActive":{color:"$blue"},"&.keyActive":{color:"$purple"},"&.focusFromKey":{outlineOffset:"2px",outline:"2px solid $colors$purple"}},Te=d(g.a.Button,{padding:"5px",border:"1px solid",...De}),Ke=d(g.a.A,{textDecoration:"underline",...De}),Pe=d(g.a.Div,{padding:"5px",border:"1px solid",outline:"none",...De}),Me=()=>{const[e,t]=r.useState(!1);r.useEffect((()=>{const e=window.setInterval((()=>(t((e=>!e)),()=>window.clearInterval(e))),5e3)}),[]);const o=r.useCallback((({hover:e,active:t,focus:o})=>"hover: ".concat(e,", active: ").concat(t,", focus: ").concat(o)),[]);return Object(C.jsxs)(Ie,{children:[Object(C.jsx)(We,{children:"Page Jump Edge Case"}),Object(C.jsx)("p",{children:"The content will jump down the page every 5 seconds, and then jump back. Alternatively, clicking the button or div will jump the page instantly. This simulates the page layout changing (external content is loaded, etc), and tests how React Interactive handles a page jump when it's in an interactive state."}),Object(C.jsx)("div",{style:{height:e?"150px":"0px"}}),Object(C.jsx)(Ee,{children:"Button:"}),Object(C.jsx)(Te,{onClick:()=>t((e=>!e)),useExtendedTouchActive:!0,children:o}),Object(C.jsx)(Ee,{children:"Link:"}),Object(C.jsx)(Ke,{href:"#",useExtendedTouchActive:!0,children:o}),Object(C.jsx)(Ee,{children:"Div:"}),Object(C.jsx)(Pe,{onClick:()=>t((e=>!e)),useExtendedTouchActive:!0,tabIndex:0,children:o})]})},ze=Object(g.b)("nav"),Ne=Object(g.b)(s.b),Le=()=>Object(C.jsxs)(C.Fragment,{children:[Object(C.jsx)(g.a.Button,{type:"submit",ref:e=>{},hoverStyle:{fontWeight:"bold"},children:"Interactive.Button"}),Object(C.jsx)(g.a.A,{href:"https://rafgraph.dev",ref:e=>{},hoverStyle:{fontWeight:"bold"},children:"Interactive.A"}),Object(C.jsx)(g.a.Div,{ref:e=>{},hoverStyle:{fontWeight:"bold"},onStateChange:({state:e,prevState:t})=>{},children:"Interactive.Div"}),Object(C.jsx)(ze,{ref:e=>{},hoverStyle:{fontWeight:"bold"},onStateChange:({state:e,prevState:t})=>{},children:"InteractiveNav"}),Object(C.jsx)(Ne,{to:"/some-path",ref:e=>{},hoverStyle:{fontWeight:"bold"},onStateChange:({state:e,prevState:t})=>{},children:"InteractiveRouterLink"})]}),He={as:"button",type:"submit",children:"propsForInteractiveButton",ref:e=>{},hoverStyle:{fontWeight:"bold"}},Ue={as:s.b,to:"/some-path",children:"propsForInteractiveRouterLink",ref:e=>{},hoverStyle:{fontWeight:"bold"}},Ge=()=>Object(C.jsxs)(C.Fragment,{children:[Object(C.jsx)(g.a,{...He}),Object(C.jsx)(g.a,{...Ue}),Object(C.jsx)(g.a,{as:"button",type:"submit",ref:e=>{},hoverStyle:{fontWeight:"bold"},children:"Interactive-as-button"}),Object(C.jsx)(g.a,{as:s.b,to:"/some-path",ref:e=>{},hoverStyle:{fontWeight:"bold"},children:"Interactive-as-Link"})]}),Je=({additionalProp:e,...t})=>Object(C.jsx)(g.a,{...t,as:"button"}),Ve=r.forwardRef((({additionalProp:e,...t},o)=>Object(C.jsx)(g.a,{...t,as:"button",ref:o}))),_e={additionalProp:"something",children:"propsForComposeAsTagNameWithRef",ref:()=>{},type:"submit",hoverStyle:{fontWeight:"bold"}},Ye=()=>Object(C.jsxs)(C.Fragment,{children:[Object(C.jsx)(Je,{type:"submit",hoverStyle:{fontWeight:"bold"},children:"ComposeAsTagNameWithoutRef"}),Object(C.jsx)(Ve,{ref:e=>{},type:"submit",hoverStyle:{fontWeight:"bold"},children:"ComposeAsTagNameWithRef"}),Object(C.jsx)(Ve,{..._e}),Object(C.jsx)(g.a,{as:"button",ref:{current:null},type:"submit",hoverStyle:{fontWeight:"bold"},children:"Interactive-as-button"})]}),qe=r.forwardRef((({someMyComponentProp:e,...t},o)=>Object(C.jsx)("button",{...t,ref:o}))),Qe=({additionalProp:e,...t})=>Object(C.jsx)(g.a,{...t,as:qe}),Xe=r.forwardRef((({additionalProp:e,...t},o)=>Object(C.jsx)(g.a,{...t,as:qe,ref:o}))),Ze={additionalProp:"something",someMyComponentProp:"something else",children:"propsForComposeAsTagNameWithRef",ref:()=>{},hoverStyle:{fontWeight:"bold"}},et=()=>Object(C.jsxs)(C.Fragment,{children:[Object(C.jsx)(Qe,{additionalProp:"something",someMyComponentProp:"something else",hoverStyle:{fontWeight:"bold"},children:"ComposeAsComponentWithoutRef"}),Object(C.jsx)(Xe,{additionalProp:"something",someMyComponentProp:"something else",ref:e=>{},hoverStyle:{fontWeight:"bold"},children:"ComposeAsComponentWithRef"}),Object(C.jsx)(Xe,{...Ze}),Object(C.jsx)(g.a,{as:qe,someMyComponentProp:"something else",hoverStyle:{fontWeight:"bold"},ref:e=>{},children:"Interactive-as-MyComponent"})]}),tt=r.forwardRef(((e,t)=>{const o=e.to&&!e.disabled?s.b:"a";let r=e;if(e.disabled){const{to:t,replace:o,...n}=e;r=n}return Object(C.jsx)(g.a,{...r,as:o,ref:t})})),ot={ref:e=>{},href:"https://rafgraph.dev",children:"propsForComposeAsUnionWithRef",hoverStyle:{fontWeight:"bold"}},rt=()=>Object(C.jsxs)(C.Fragment,{children:[Object(C.jsx)(tt,{to:"/some-path",replace:!0,ref:e=>{},hoverStyle:{fontWeight:"bold"},children:"ComposeAsUnionWithRef-RouterLink"}),Object(C.jsx)(tt,{disabled:!0,to:"/some-path",replace:!0,ref:e=>{},hoverStyle:{fontWeight:"bold"},disabledStyle:{opacity:.5},children:"ComposeAsUnionWithRef-RouterLink-disabled"}),Object(C.jsx)(tt,{href:"https://rafgraph.dev",ref:e=>{},hoverStyle:{fontWeight:"bold"},children:"ComposeAsUnionWithRef-AnchorLink"}),Object(C.jsx)(tt,{...ot})]}),nt=d("div",{"&>*":{display:"block"},"&>h1":{fontSize:"20px"}}),ct=()=>Object(C.jsx)(s.a,{children:Object(C.jsxs)(nt,{children:[Object(C.jsx)("h1",{children:"TypeScript Examples"}),Object(C.jsx)(Le,{}),Object(C.jsx)(Ge,{}),Object(C.jsx)(Ye,{}),Object(C.jsx)(et,{}),Object(C.jsx)(rt,{})]})}),st=()=>(u(),Object(C.jsx)(s.a,{children:Object(C.jsxs)(i.d,{children:[Object(C.jsx)(i.b,{exact:!0,path:"/",component:Oe}),Object(C.jsx)(i.b,{path:"/disabled-edge-case",component:Be}),Object(C.jsx)(i.b,{path:"/page-jump-edge-case",component:Me}),Object(C.jsx)(i.b,{path:"/typescript",component:ct}),Object(C.jsx)(i.b,{render:()=>Object(C.jsx)(i.a,{to:"/"})})]})}));c.a.render(Object(C.jsx)(r.StrictMode,{children:Object(C.jsx)(st,{})}),document.getElementById("root"))}},[[43,1,2]]]);
//# sourceMappingURL=main.2d482366.chunk.js.map