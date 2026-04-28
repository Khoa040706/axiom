import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import React from "react"
import { Document, Page, Text, View, StyleSheet, renderToBuffer, Font } from "@react-pdf/renderer"

Font.register({
  family: "Arial",
  fonts: [
    { src: "C:\\Windows\\Fonts\\arial.ttf",   fontWeight: 400 },
    { src: "C:\\Windows\\Fonts\\arialbd.ttf", fontWeight: 700 },
  ],
})
Font.registerHyphenationCallback((word) => [word])

const T = {
  vi: {
    reportTitle:"B\u00c1O C\u00c1O T\u1ed4NG QUAN", badge:"B\u00e1o c\u00e1o Gi\u00e1m \u0111\u1ed1c",
    kpi1:"T\u1ed5ng nh\u00e2n s\u1ef1", kpi1s:"\u0110ang l\u00e0m vi\u1ec7c",
    kpi2:"Th\u1eed vi\u1ec7c", kpi2s:"Nh\u00e2n vi\u00ean m\u1edbi",
    kpi3:"Qu\u1ef9 l\u01b0\u01a1ng Net", kpi3s:"Th\u00e1ng hi\u1ec7n t\u1ea1i (tri\u1ec7u \u0111)",
    kpi4:"L\u01b0\u01a1ng TB/ng\u01b0\u1eddi", kpi4s:"Tri\u1ec7u \u0111\u1ed3ng/th\u00e1ng",
    kpi5:"\u0110\u01a1n ngh\u1ec9 ch\u1edd duy\u1ec7t", kpi5s:"C\u1ea7n ph\u00ea duy\u1ec7t",
    kpi6:"H\u0110 s\u1eafp h\u1ebft h\u1ea1n", kpi6s:"Trong 30 ng\u00e0y t\u1edbi",
    secDept:"Nh\u00e2n l\u1ef1c theo ph\u00f2ng ban",
    colDept:"Ph\u00f2ng ban", colCount:"S\u1ed1 NV", colRate:"T\u1ef7 l\u1ec7",
    secStatus:"T\u00ecnh tr\u1ea1ng nh\u00e2n vi\u00ean",
    colStatus:"Tr\u1ea1ng th\u00e1i", colQty:"SL",
    secContract:"Ph\u00e2n lo\u1ea1i h\u1ee3p \u0111\u1ed3ng",
    colContract:"Lo\u1ea1i h\u1ee3p \u0111\u1ed3ng",
    secPayroll:"L\u1ecbch s\u1eed qu\u1ef9 l\u01b0\u01a1ng Gross v\u00e0 Net (6 th\u00e1ng)",
    colMonth:"Th\u00e1ng", colGross:"Gross (Tr.\u0111)", colNet:"Net (Tr.\u0111)", colCmp:"So s\u00e1nh Net",
    secAttend:"Ch\u1ea5m c\u00f4ng 6 th\u00e1ng g\u1ea7n \u0111\u00e2y",
    colFull:"\u0110\u1ee7 gi\u1edd", colLate:"\u0110i mu\u1ed9n", colAbs:"V\u1eafng m\u1eb7t",
    secLeave:"Lo\u1ea1i ngh\u1ec9 ph\u00e9p",
    colLeave:"Lo\u1ea1i", colReqs:"S\u1ed1 \u0111\u01a1n",
    secHire:"Tuy\u1ec3n d\u1ee5ng m\u1edbi (6 th\u00e1ng)", colNew:"Nh\u00e2n vi\u00ean m\u1edbi",
    secActivity:"Ho\u1ea1t \u0111\u1ed9ng g\u1ea7n \u0111\u00e2y",
    colType:"Lo\u1ea1i", colContent:"N\u1ed9i dung", colStatusH:"Tr\u1ea1ng th\u00e1i", colDate:"Ng\u00e0y",
    typeLeave:"Ngh\u1ec9 ph\u00e9p", typeContract:"H\u1ee3p \u0111\u1ed3ng",
    msgLeave:(name:string,sub:string)=>`${name} - ${sub}`,
    msgContract:(sub:string,name:string)=>`${sub} - ${name}`,
    footTotal:"T\u1ed5ng c\u1ed9ng", footPeople:"NV",
    sign1:"Ng\u01b0\u1eddi l\u1eadp b\u00e1o c\u00e1o", sign2:"K\u1ebf to\u00e1n tr\u01b0\u1edfng", sign3:"Gi\u00e1m \u0111\u1ed1c",
    signDate:(d:string)=>`Ng\u00e0y ${d}`,
    sign2Sub:"K\u00fd & ghi r\u00f5 h\u1ecd t\u00ean", sign3Sub:"Ph\u00ea duy\u1ec7t",
    footer:"AXIOM HRM & Payroll Management System",
    exported:(t:string)=>`Xu\u1ea5t l\u00fac ${t}`, noData:"\u2014",
  },
  en: {
    reportTitle:"EXECUTIVE OVERVIEW", badge:"Director Report",
    kpi1:"Total Staff", kpi1s:"Active employees",
    kpi2:"On Probation", kpi2s:"New hires",
    kpi3:"Net Payroll", kpi3s:"Current month (MVND)",
    kpi4:"Avg Net/Person", kpi4s:"Million VND/month",
    kpi5:"Pending Leaves", kpi5s:"Need approval",
    kpi6:"Expiring Contracts", kpi6s:"Within 30 days",
    secDept:"Workforce by Department",
    colDept:"Department", colCount:"Staff", colRate:"Share",
    secStatus:"Employee Status", colStatus:"Status", colQty:"Count",
    secContract:"Contract Type Breakdown", colContract:"Contract Type",
    secPayroll:"Gross vs Net Payroll Trend (6 months)",
    colMonth:"Month", colGross:"Gross (MVND)", colNet:"Net (MVND)", colCmp:"Net Change",
    secAttend:"6-Month Attendance Trend",
    colFull:"Full", colLate:"Late", colAbs:"Absent",
    secLeave:"Leave Type Distribution", colLeave:"Type", colReqs:"Requests",
    secHire:"New Hire Trend (6 months)", colNew:"New Hires",
    secActivity:"Recent Activity",
    colType:"Type", colContent:"Description", colStatusH:"Status", colDate:"Date",
    typeLeave:"Leave", typeContract:"Contract",
    msgLeave:(name:string,sub:string)=>`${name} - ${sub}`,
    msgContract:(sub:string,name:string)=>`${sub} - ${name}`,
    footTotal:"Total", footPeople:"staff",
    sign1:"Prepared by", sign2:"Chief Accountant", sign3:"Director",
    signDate:(d:string)=>d,
    sign2Sub:"Sign & full name", sign3Sub:"Approved",
    footer:"AXIOM HRM & Payroll Management System",
    exported:(t:string)=>`Exported at ${t}`, noData:"\u2014",
  },
} as const
type Lang = keyof typeof T

// All Vietnamese DB values → English
const DB_EN: Record<string,string> = {
  // leave/contract statuses
  "Ch\u1edd duy\u1ec7t":"Pending","\u0110\u00e3 duy\u1ec7t":"Approved","T\u1eeb ch\u1ed1i":"Rejected",
  "Hi\u1ec7u l\u1ef1c":"Active","H\u1ebft h\u1ea1n":"Expired",
  // employee statuses (both long and short forms)
  "Th\u1eed vi\u1ec7c":"Probation",
  "\u0110ang l\u00e0m vi\u1ec7c":"Working","\u0110ang l\u00e0m":"Working",
  "Ngh\u1ec9 ph\u00e9p":"On Leave","T\u1ea1m ng\u1eebng":"Suspended",
  "Ngh\u1ec9 vi\u1ec7c":"Resigned","Th\u00f4i vi\u1ec7c":"Resigned",
  // contract types
  "Ch\u00ednh th\u1ee9c":"Official","Th\u1eddi v\u1ee5":"Seasonal",
  "B\u00e1n th\u1eddi gian":"Part-time","To\u00e0n th\u1eddi gian":"Full-time",
  // leave types (both "Nghỉ X" and short "X" forms)
  "Ngh\u1ec9 b\u1ec7nh":"Sick Leave","B\u1ec7nh":"Sick Leave",
  "Ngh\u1ec9 ph\u00e9p n\u0103m":"Annual Leave","Ph\u00e9p n\u0103m":"Annual Leave",
  "Ngh\u1ec9 vi\u1ec7c ri\u00eang":"Personal Leave","Vi\u1ec7c ri\u00eang":"Personal Leave",
  "Ngh\u1ec9 thai s\u1ea3n":"Maternity Leave","Thai s\u1ea3n":"Maternity Leave",
  "Ngh\u1ec9 kh\u00f4ng l\u01b0\u01a1ng":"Unpaid Leave","Kh\u00f4ng l\u01b0\u01a1ng":"Unpaid Leave",
  "Ngh\u1ec9 l\u1ec5":"Public Holiday",
  // department names
  "C\u00f4ng ngh\u1ec7 th\u00f4ng tin":"Information Technology",
  "K\u1ebf to\u00e1n - T\u00e0i ch\u00ednh":"Accounting - Finance",
  "Nh\u00e2n s\u1ef1":"Human Resources",
  "Kinh doanh":"Business",
  "S\u1ea3n xu\u1ea5t":"Manufacturing",
  "H\u00e0nh ch\u00ednh":"Administration",
  "K\u1ef9 thu\u1eadt":"Engineering",
  "D\u1ecbch v\u1ee5":"Services",
}
const STATUS_EN = DB_EN
function xlat(lang:Lang, val:string):string {
  if(lang==="vi") return val
  return DB_EN[val]??val
}



const RED="#D0211C",GRAY1="#1E293B",GRAY2="#64748B",GRAY3="#94A3B8"
const BGROW="#FEF2F2",GREEN="#059669",PURPLE="#7C3AED",AMBER="#D97706",BLUE="#0EA5E9"
const PIE_COLORS=[RED,GREEN,PURPLE,AMBER,BLUE,"#EC4899","#14B8A6"]

const s = StyleSheet.create({
  page:      { fontFamily:"Arial", fontSize:9, color:GRAY1, backgroundColor:"#F8FAFC", padding:0 },
  header:    { backgroundColor:RED, padding:"18 28", flexDirection:"row", justifyContent:"space-between", alignItems:"center" },
  brandBox:  { flexDirection:"row", alignItems:"center", gap:10 },
  brand:     { fontSize:20, fontWeight:"bold", color:"#fff", letterSpacing:3 },
  brandSub:  { fontSize:7.5, color:"rgba(255,255,255,0.7)", marginTop:2 },
  metaBox:   { alignItems:"flex-end" },
  metaTitle: { fontSize:13, fontWeight:"bold", color:"#fff" },
  metaDate:  { fontSize:7.5, color:"rgba(255,255,255,0.7)", marginTop:3 },
  badge:     { backgroundColor:"rgba(255,255,255,0.18)", borderRadius:4, padding:"3 8", marginTop:4 },
  badgeTxt:  { fontSize:7.5, color:"rgba(255,255,255,0.85)", fontWeight:"bold" },
  content:   { padding:"16 28" },
  kpiRow:    { flexDirection:"row", gap:8, marginBottom:14 },
  kpiCard:   { flex:1, borderRadius:8, padding:"10 12" },
  kpiLabel:  { fontSize:7.5, color:"rgba(255,255,255,0.82)", marginBottom:4 },
  kpiValue:  { fontSize:22, fontWeight:"bold", color:"#fff" },
  kpiSub:    { fontSize:7, color:"rgba(255,255,255,0.65)", marginTop:3 },
  secTitle:  { fontSize:9.5, fontWeight:"bold", color:GRAY1, marginBottom:6, marginTop:12,
               borderLeftWidth:3, borderLeftColor:RED, paddingLeft:6 },
  tbl:       { borderRadius:6, overflow:"hidden", marginBottom:10, borderWidth:1, borderColor:"#E2E8F0" },
  thead:     { flexDirection:"row", backgroundColor:RED },
  th:        { padding:"6 8", fontSize:7.5, fontWeight:"bold", color:"#fff" },
  tbody:     {},
  tr:        { flexDirection:"row", borderBottomWidth:1, borderBottomColor:"#E2E8F0" },
  trAlt:     { flexDirection:"row", borderBottomWidth:1, borderBottomColor:"#E2E8F0", backgroundColor:BGROW },
  td:        { padding:"5.5 8", fontSize:8, color:GRAY1 },
  tfoot:     { flexDirection:"row", backgroundColor:GRAY1 },
  tfdTxt:    { padding:"5.5 8", fontSize:8, fontWeight:"bold", color:"#fff" },
  pill:      { borderRadius:20, paddingHorizontal:7, paddingVertical:2, alignSelf:"flex-start" },
  pillTxt:   { fontSize:7.5, fontWeight:"bold", color:"#fff" },
  barWrap:   { flexDirection:"row", alignItems:"center", gap:5 },
  barBg:     { flex:1, backgroundColor:"#F1F5F9", borderRadius:3, height:5, overflow:"hidden" },
  barFill:   { height:5, borderRadius:3 },
  trendUp:   { color:GREEN, fontSize:8, fontWeight:"bold" },
  trendDn:   { color:RED,   fontSize:8, fontWeight:"bold" },
  twoCol:    { flexDirection:"row", gap:12, marginBottom:0 },
  col:       { flex:1 },
  signRow:   { flexDirection:"row", gap:16, marginTop:16, paddingTop:12, borderTopWidth:1, borderTopColor:"#E2E8F0" },
  signBox:   { flex:1, alignItems:"center" },
  signTitle: { fontSize:8.5, color:GRAY2, fontWeight:"bold", marginBottom:2 },
  signDate:  { fontSize:7.5, color:GRAY3, marginBottom:32 },
  signLine:  { borderTopWidth:1, borderTopColor:"#CBD5E1", width:"100%", paddingTop:4, alignItems:"center" },
  signName:  { fontSize:8.5, fontWeight:"bold", color:GRAY1 },
  footerBar: { backgroundColor:"#F8FAFC", borderTopWidth:1, borderTopColor:"#E2E8F0",
               padding:"8 28", flexDirection:"row", justifyContent:"space-between" },
  footerTxt: { fontSize:7.5, color:GRAY3 },
})

function C(type:any,props:any,...children:any[]){return React.createElement(type,props,...children)}
function SecTitle(label:string){return C(Text,{style:s.secTitle},label)}
function THead(...cols:{label:string;width?:number;flex?:number;align?:string}[]){
  return C(View,{style:s.thead},...cols.map(c=>C(Text,{style:[s.th,{...(c.width?{width:c.width}:{flex:c.flex??1}),textAlign:c.align??"left"}]},c.label)))
}
function TRow(alt:boolean,...cells:React.ReactNode[]){return C(View,{style:alt?s.trAlt:s.tr},...cells)}
function TD(content:React.ReactNode,opts?:{width?:number;flex?:number;align?:string;bold?:boolean;color?:string}){
  const{width,flex,align,bold,color}=opts??{}
  return C(View,{style:[s.td,{...(width?{width}:{flex:flex??1}),justifyContent:"center"}]},
    typeof content==="string"||typeof content==="number"
      ?C(Text,{style:{textAlign:align??"left",fontWeight:bold?"bold":"normal",color:color??GRAY1}},String(content))
      :content)
}
function Pill(label:string,color:string){return C(View,{style:[s.pill,{backgroundColor:color}]},C(Text,{style:s.pillTxt},label))}
function Bar(pct:number,color:string){
  return C(View,{style:s.barWrap},
    C(View,{style:s.barBg},C(View,{style:[s.barFill,{width:Math.round(pct*0.85),backgroundColor:color}]})),
    C(Text,{style:{fontSize:7.5,fontWeight:"bold",color}},`${pct}%`))
}

function DashboardReport({d,lang}:{d:any;lang:Lang}){
  const t=T[lang]
  const{total,trial,latestNet,avgNet,pendingLeave,expiringContracts,
        depts,payRows,empStatus,contractTypes,leaveTypes,newHires,
        attendRows,activity,dateStr,now}=d
  const maxDept=Math.max(...(depts?.map((x:any)=>x.count)??[1]),1)
  const locale=lang==="vi"?"vi-VN":"en-US"
  const SC:Record<string,string>={
    "\u0110\u00e3 duy\u1ec7t":GREEN,"Ch\u1edd duy\u1ec7t":AMBER,"T\u1eeb ch\u1ed1i":RED,"Hi\u1ec7u l\u1ef1c":BLUE,
    "Approved":GREEN,"Pending":AMBER,"Rejected":RED,"Active":BLUE,
  }

  // Always call these as functions — never reuse element instances across pages
  const mkHeader=()=>C(View,{style:s.header},
    C(View,{style:s.brandBox},
      C(View,{style:{flexDirection:"column"}},
        C(Text,{style:s.brand},"AXIOM"),
        C(Text,{style:s.brandSub},"HRM & PAYROLL MANAGEMENT SYSTEM"),
      )
    ),
    C(View,{style:s.metaBox},
      C(Text,{style:s.metaTitle},t.reportTitle),
      C(Text,{style:s.metaDate},dateStr),
      C(View,{style:s.badge},C(Text,{style:s.badgeTxt},t.badge)),
    ),
  )
  const mkFooter=()=>C(View,{style:s.footerBar},
    C(Text,{style:s.footerTxt},t.footer),
    C(Text,{style:s.footerTxt},t.exported(now)),
  )

  // ── PAGE 1: Overview stats ────────────────────────────────────────────
  const page1=C(Page,{size:"A4",style:s.page},
    mkHeader(),
    C(View,{style:s.content},
      C(View,{style:s.kpiRow},
        ...[
          {label:t.kpi1,value:String(total),sub:t.kpi1s,bg:RED},
          {label:t.kpi2,value:String(trial),sub:t.kpi2s,bg:PURPLE},
          {label:t.kpi3,value:`${latestNet}M`,sub:t.kpi3s,bg:GREEN},
          {label:t.kpi4,value:`${avgNet}M`,sub:t.kpi4s,bg:BLUE},
          {label:t.kpi5,value:String(pendingLeave),sub:t.kpi5s,bg:AMBER},
          {label:t.kpi6,value:String(expiringContracts),sub:t.kpi6s,bg:"#EF4444"},
        ].map(k=>C(View,{key:k.label,style:[s.kpiCard,{backgroundColor:k.bg}]},
          C(Text,{style:s.kpiLabel},k.label),
          C(Text,{style:s.kpiValue},k.value),
          C(Text,{style:s.kpiSub},k.sub),
        ))
      ),
      C(View,{style:s.twoCol},
        C(View,{style:[s.col,{flex:2}]},
          SecTitle(t.secDept),
          C(View,{style:s.tbl},
            THead({label:"#",width:20},{label:t.colDept,flex:2},{label:t.colCount,width:52,align:"center"},{label:t.colRate,flex:1}),
            C(View,{style:s.tbody},
              ...(depts??[]).map((dep:any,i:number)=>{
                const pct=total>0?Math.round((dep.count/maxDept)*100):0
                return TRow(i%2!==0,
                  TD(i+1,{width:20,color:GRAY3}),
                  TD(xlat(lang,dep.name),{flex:2,bold:true}),
                  C(View,{style:[s.td,{width:52,alignItems:"center"}]},Pill(`${dep.count}`,PIE_COLORS[i%PIE_COLORS.length])),
                  C(View,{style:[s.td,{flex:1,justifyContent:"center"}]},Bar(pct,PIE_COLORS[i%PIE_COLORS.length])),
                )
              })
            ),
            C(View,{style:s.tfoot},
              C(Text,{style:[s.tfdTxt,{flex:2}]},t.footTotal),
              C(Text,{style:[s.tfdTxt,{width:52,textAlign:"center"}]},`${total} ${t.footPeople}`),
              C(Text,{style:[s.tfdTxt,{flex:1}]},"100%"),
            ),
          ),
        ),
        C(View,{style:s.col},
          SecTitle(t.secStatus),
          C(View,{style:s.tbl},
            THead({label:t.colStatus,flex:2},{label:t.colQty,width:30,align:"center"},{label:t.colRate,width:38}),
            C(View,{style:s.tbody},
              ...(empStatus??[]).map((r:any,i:number)=>{
                const pct=total>0?Math.round((r.value/total)*100):0
                return TRow(i%2!==0,
                  TD(xlat(lang,r.name),{flex:2}),
                  TD(r.value,{width:30,align:"center",bold:true,color:PIE_COLORS[i%PIE_COLORS.length]}),
                  C(View,{style:[s.td,{width:38}]},C(Text,{style:{fontSize:7.5,color:PIE_COLORS[i%PIE_COLORS.length],fontWeight:"bold"}},`${pct}%`)),
                )
              })
            ),
          ),
          SecTitle(t.secContract),
          C(View,{style:s.tbl},
            THead({label:t.colContract,flex:2},{label:t.colQty,width:30,align:"center"}),
            C(View,{style:s.tbody},
              ...(contractTypes??[]).map((r:any,i:number)=>TRow(i%2!==0,
                TD(xlat(lang,r.name),{flex:2}),
                TD(r.value,{width:30,align:"center",bold:true,color:PIE_COLORS[i%PIE_COLORS.length]}),
              ))
            ),
          ),
        ),
      ),
      ...(payRows?.length>0?[C(View,{},
        SecTitle(t.secPayroll),
        C(View,{style:s.tbl},
          THead({label:t.colMonth,width:55},{label:t.colGross,flex:1,align:"right"},{label:t.colNet,flex:1,align:"right"},{label:t.colCmp,flex:1,align:"right"}),
          C(View,{style:s.tbody},
            ...(payRows??[]).map((r:any,i:number)=>{
              const prev=i>0?payRows[i-1].net:null
              const diff=prev!==null?r.net-prev:null
              return TRow(i%2!==0,
                TD(r.label,{width:55,bold:true}),
                TD(`${r.gross}M`,{flex:1,align:"right",color:AMBER}),
                TD(`${r.net}M`,{flex:1,align:"right",color:GREEN,bold:true}),
                C(View,{style:[s.td,{flex:1,justifyContent:"flex-end"}]},
                  C(Text,{style:diff===null?{}:diff>=0?s.trendUp:s.trendDn},
                    diff===null?"—":diff>=0?`+${diff}M`:`${diff}M`)
                ),
              )
            })
          ),
        ),
      )]:[]),
      C(View,{style:[s.twoCol,{marginTop:0}]},
        C(View,{style:[s.col,{flex:2}]},
          SecTitle(t.secAttend),
          C(View,{style:s.tbl},
            THead({label:t.colMonth,width:32},{label:t.colFull,flex:1,align:"center"},{label:t.colLate,flex:1,align:"center"},{label:t.colAbs,flex:1,align:"center"}),
            C(View,{style:s.tbody},
              ...(attendRows??[]).map((r:any,i:number)=>TRow(i%2!==0,
                TD(r.month,{width:32,bold:true}),
                TD(r.dayDu,{flex:1,align:"center",color:GREEN}),
                TD(r.diMuon,{flex:1,align:"center",color:AMBER}),
                TD(r.vangMat,{flex:1,align:"center",color:RED}),
              ))
            ),
          ),
        ),
        C(View,{style:s.col},
          SecTitle(t.secLeave),
          C(View,{style:s.tbl},
            THead({label:t.colLeave,flex:2},{label:t.colReqs,width:40,align:"center"}),
            C(View,{style:s.tbody},
              ...(leaveTypes??[]).map((r:any,i:number)=>TRow(i%2!==0,
                TD(xlat(lang,r.type),{flex:2}),
                TD(r.count,{width:40,align:"center",bold:true,color:PURPLE}),
              ))
            ),
          ),
          SecTitle(t.secHire),
          C(View,{style:s.tbl},
            THead({label:t.colMonth,flex:1},{label:t.colNew,flex:1,align:"center"}),
            C(View,{style:s.tbody},
              ...(newHires??[]).filter((r:any)=>r.count>0).map((r:any,i:number)=>
                TRow(i%2!==0,TD(r.month,{flex:1,bold:true}),TD(r.count,{flex:1,align:"center",bold:true,color:BLUE}))
              )
            ),
          ),
        ),
      ),
      // ── Trang 2: break:true bên trong s.content ─────────────────────
      C(View,{break:true},
        // Header full-width (negative margin thoát khỏi padding content)
        C(View,{style:[s.header,{marginHorizontal:-28,marginTop:-16,marginBottom:16}]},
          C(View,{style:s.brandBox},
            C(View,{style:{flexDirection:"column"}},
              C(Text,{style:s.brand},"AXIOM"),
              C(Text,{style:s.brandSub},"HRM & PAYROLL MANAGEMENT SYSTEM"),
            )
          ),
          C(View,{style:s.metaBox},
            C(Text,{style:s.metaTitle},t.reportTitle),
            C(Text,{style:s.metaDate},dateStr),
            C(View,{style:s.badge},C(Text,{style:s.badgeTxt},t.badge)),
          ),
        ),
        C(Text,{style:[s.secTitle,{fontSize:12,marginTop:0,marginBottom:10}]},t.secActivity),
        C(View,{style:s.tbl},
          THead(
            {label:t.colType,width:70},
            {label:t.colContent,flex:1},
            {label:t.colStatusH,width:75},
            {label:t.colDate,width:75},
          ),
          C(View,{style:s.tbody},
            ...(activity??[]).map((a:any,i:number)=>{
              const typeLbl=a.type==="leave"?t.typeLeave:t.typeContract
              const subType=xlat(lang,a.subType)
              const statusLbl=xlat(lang,a.status)
              const content=a.type==="leave"?t.msgLeave(a.name,subType):t.msgContract(subType,a.name)
              const sColor=SC[statusLbl]??SC[a.status]??GRAY2
              return TRow(i%2!==0,
                C(View,{style:[s.td,{width:70,justifyContent:"center"}]},Pill(typeLbl,a.type==="leave"?PURPLE:BLUE)),
                C(View,{style:[s.td,{flex:1}]},C(Text,{style:{fontSize:9,color:GRAY1,fontWeight:"bold"}},content)),
                C(View,{style:[s.td,{width:75,justifyContent:"center"}]},Pill(statusLbl,sColor)),
                C(View,{style:[s.td,{width:75,justifyContent:"center"}]},C(Text,{style:{fontSize:8.5,color:GRAY2}},new Date(a.time).toLocaleDateString(locale))),
              )
            })
          ),
        ),
        C(View,{style:[s.signRow,{marginTop:40}]},
          C(View,{style:s.signBox},
            C(Text,{style:s.signTitle},t.sign1),
            C(Text,{style:s.signDate},t.signDate(now)),
            C(View,{style:s.signLine},C(Text,{style:s.signName},"............................"),),
          ),
          C(View,{style:s.signBox},
            C(Text,{style:s.signTitle},t.sign2),
            C(Text,{style:s.signDate},t.sign2Sub),
            C(View,{style:s.signLine},C(Text,{style:s.signName},"............................"),),
          ),
          C(View,{style:s.signBox},
            C(Text,{style:s.signTitle},t.sign3),
            C(Text,{style:s.signDate},t.sign3Sub),
            C(View,{style:s.signLine},C(Text,{style:s.signName},"............................"),),
          ),
        ),
      ),
    ),
    mkFooter(),
  )

  return C(Document,{title:`AXIOM HRM Report \u2014 ${dateStr}`},page1)
}

// ── Route Handler ─────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const lang: Lang = req.nextUrl.searchParams.get("lang") === "en" ? "en" : "vi"
    const [empAgg,empGroups,pendingLeave,expiringContracts,
           deptRaw,payrollRaw,contractGroups,leaveGroups,
           newHireData,attendData,actLeaves,actContracts] = await Promise.all([
      prisma.employee.aggregate({_count:{_all:true}}),
      prisma.employee.groupBy({by:["status"],_count:{status:true}}),
      prisma.leaveRequest.count({where:{status:"Ch\u1edd duy\u1ec7t"}}),
      prisma.contract.count({where:{status:"Hi\u1ec7u l\u1ef1c",endDate:{gte:new Date(),lte:new Date(Date.now()+30*86400000)}}}),
      prisma.department.findMany({where:{isActive:true},include:{_count:{select:{employees:true}}},orderBy:{name:"asc"}}),
      prisma.payroll.groupBy({by:["payMonth","payYear"],_sum:{netSalary:true,grossSalary:true},orderBy:[{payYear:"desc"},{payMonth:"desc"}],take:6}),
      prisma.contract.groupBy({by:["contractType"],_count:{contractType:true}}),
      prisma.leaveRequest.groupBy({by:["leaveType"],_count:{leaveType:true}}),
      (async()=>{
        const rows=[]
        for(let i=5;i>=0;i--){
          const d=new Date();d.setMonth(d.getMonth()-i)
          const st=new Date(d.getFullYear(),d.getMonth(),1),en=new Date(d.getFullYear(),d.getMonth()+1,1)
          rows.push({month:`T${d.getMonth()+1}`,count:await prisma.employee.count({where:{hireDate:{gte:st,lt:en}}})})
        }
        return rows
      })(),
      (async()=>{
        const rows=[]
        for(let i=5;i>=0;i--){
          const d=new Date();d.setMonth(d.getMonth()-i)
          const st=new Date(d.getFullYear(),d.getMonth(),1),en=new Date(d.getFullYear(),d.getMonth()+1,1)
          const [dayDu,diMuon,vangMat]=await Promise.all([
            prisma.attendance.count({where:{workDate:{gte:st,lt:en},status:"\u0110i l\u00e0m",lateMinutes:{lte:0}}}),
            prisma.attendance.count({where:{workDate:{gte:st,lt:en},lateMinutes:{gt:0}}}),
            prisma.attendance.count({where:{workDate:{gte:st,lt:en},status:{not:"\u0110i l\u00e0m"}}}),
          ])
          rows.push({month:`T${d.getMonth()+1}`,dayDu,diMuon,vangMat})
        }
        return rows
      })(),
      prisma.leaveRequest.findMany({take:8,orderBy:{createdAt:"desc"},include:{employee:{select:{fullName:true}}}}),
      prisma.contract.findMany({take:8,orderBy:{createdAt:"desc"},include:{employee:{select:{fullName:true}}}}),
    ])

    const total=empAgg._count._all
    const depts=deptRaw.filter(d=>d._count.employees>0).map(d=>({name:d.name,count:d._count.employees})).sort((a,b)=>b.count-a.count)
    const payRows=[...payrollRaw].reverse().map(r=>({label:`T${r.payMonth}/${r.payYear}`,gross:Math.round(Number(r._sum.grossSalary??0)/1_000_000),net:Math.round(Number(r._sum.netSalary??0)/1_000_000)}))
    const latestNet=payRows.length>0?payRows[payRows.length-1].net:0
    const avgNet=payRows.length>0&&total>0?Math.round(payRows[payRows.length-1].net/total):0
    const empStatus=empGroups.map(r=>({name:r.status,value:r._count.status}))
    const contractTypes=contractGroups.map(r=>({name:r.contractType,value:r._count.contractType}))
    const leaveTypes=leaveGroups.map(r=>({type:r.leaveType,count:r._count.leaveType}))
    const trial=empStatus.find(e=>e.name==="\u0054\u0068\u1eed \u0076\u0069\u1ec7\u0063")?.value??0
    const activity=[
      ...actLeaves.map(l=>({type:"leave",name:l.employee.fullName,subType:l.leaveType,status:l.status,time:l.createdAt})),
      ...actContracts.map(c=>({type:"contract",name:c.employee.fullName,subType:c.contractType,status:c.status,time:c.createdAt})),
    ].sort((a,b)=>b.time.getTime()-a.time.getTime()).slice(0,8)

    const locale=lang==="vi"?"vi-VN":"en-US"
    const nowDate=new Date()
    const dateStr=nowDate.toLocaleDateString(locale,{weekday:"long",day:"numeric",month:"long",year:"numeric"})
    const nowStr=nowDate.toLocaleString(locale)

    const pdfBuffer=await renderToBuffer(
      React.createElement(DashboardReport,{
        d:{total,trial,latestNet,avgNet,pendingLeave,expiringContracts,
           depts,payRows,empStatus,contractTypes,leaveTypes,
           newHires:newHireData,attendRows:attendData,activity,dateStr,now:nowStr},
        lang,
      }) as any
    )

    const today=new Date()
    const fileName=`AXIOM_Report_${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}_${lang}.pdf`
    return new NextResponse(new Uint8Array(pdfBuffer),{
      headers:{
        "Content-Type":"application/pdf",
        "Content-Disposition":`attachment; filename="${fileName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
      },
    })
  } catch(err){
    console.error("[dashboard-pdf]",err)
    return NextResponse.json({error:"Cannot generate PDF report"},{status:500})
  }
}

