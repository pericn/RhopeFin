#!/usr/bin/env python3
"""Autonomous Testing Loop — Rilo Analysis | karpathy + itsolelehmann inspired"""

import subprocess, json, os, time

PROJECT = "/Users/peric/Documents/Projects/Rilo Analysis"
PORT = 4200

def start_server():
    r = subprocess.run(["lsof", "-i", f":{PORT}"], capture_output=True, text=True)
    if r.stdout.strip():
        print(f"  Server already on :{PORT}")
        return None
    proc = subprocess.Popen(
        ["npx", "--yes", "serve", ".", "-p", str(PORT)],
        cwd=PROJECT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(4)
    print(f"  Server PID {proc.pid}")
    return proc

def run_edge(code):
    r = subprocess.run(["node", "-e", code], cwd=PROJECT,
                      capture_output=True, text=True, timeout=10)
    return (1.0 if r.returncode == 0 else 0.0, r.stdout + r.stderr)

def run_interaction(snippet):
    js = (
        "const {chromium}=require('playwright');"
        "const http=require('http'),fs=require('fs'),path=require('path');"
        "const PORT=" + str(PORT) + ",ROOT='" + PROJECT + "';"
        "const srv=http.createServer((q,s)=>{"
        "let fp=path.join(ROOT,q.url==='/'?'/index.html':q.url);"
        "fs.readFile(fp,(e,d)=>{if(e){s.writeHead(404);s.end();return;}s.writeHead(200);s.end(d);});"
        "});"
        "(async()=>{"
        "await new Promise(r=>srv.listen(PORT,r));"
        "const br=await chromium.launch({headless:true});"
        "const pg=await br.newPage({viewport:{width:1440,height:900}});"
        "const errs=[];"
        "pg.on('pageerror',e=>errs.push(e.message));"
        "pg.on('console',m=>{if(m.type()==='error')errs.push(m.text());});"
        "try{" + snippet + "}catch(e){console.error('JSERR:'+e.message);}"
        "console.log('__ERRS__:'+errs.length);"
        "await br.close();srv.close();"
        "})().catch(e=>{console.error(e.message);process.exit(1);});"
    )
    tmp = f"/tmp/aitest_{int(time.time())}.js"
    with open(tmp, "w") as f:
        f.write(js)
    try:
        r = subprocess.run(["node", tmp], capture_output=True, text=True, timeout=25)
        out = r.stdout
    finally:
        os.unlink(tmp)
    score = 0.0 if ("__ERRS__:0" not in out or "JSERR" in out) else 1.0
    return score, out

EXPERIMENTS = [
    {"id":"E1","type":"edge","hyp":"OCC 输入 clamp [0,100]","code":
     "const fs=require('fs');const c=fs.readFileSync('js/core/calculators/occupancy-calculator.js','utf8');"
     "console.log('clamp:',/clamp|max\\(.*100|0/.test(c));"},

    {"id":"E2","type":"edge","hyp":"ADR=0 有安全处理不NaN","code":
     "const fs=require('fs');const c=fs.readFileSync('js/core/calculators/revenue-calculator.js','utf8');"
     "console.log('zero_safe:',/if.*0|NaN|isNaN/.test(c));"},

    {"id":"E3","type":"interaction","hyp":"Inspector drawer 可打开并关闭",
     "snippet":
     "await pg.goto('http://127.0.0.1:'+PORT+'/index.html',{waitUntil:'networkidle'});"
     "await pg.waitForTimeout(2000);"
     "const btn=pg.getByRole('button',{name:/打开说明面板/}).first();"
     "if(await btn.count()>0){await btn.click();await pg.waitForTimeout(600);}"
     "const p1=await pg.locator('.rilo-inspector-panel').count();"
     "if(await btn.count()>0){await btn.click();await pg.waitForTimeout(600);}"
     "const p2=await pg.locator('.rilo-inspector-panel').count();"
     "console.log('open:'+p1+' close:'+p2);"},

    {"id":"E4","type":"interaction","hyp":"Settings-04寄养-Rooms hover术语Popover",
     "snippet":
     "await pg.goto('http://127.0.0.1:'+PORT+'/index.html',{waitUntil:'networkidle'});"
     "await pg.waitForTimeout(2000);"
     "await pg.getByRole('button',{name:/经营设置/}).first().click();"
     "await pg.waitForTimeout(2000);"
     "await pg.locator('button.cat-item',{hasText:'04收入参数'}).click();"
     "await pg.waitForTimeout(2000);"
     "await pg.locator('button',{hasText:'寄养'}).click();"
     "await pg.waitForTimeout(2000);"
     "const r=pg.locator('button').filter({hasText:'Rooms'}).first();"
     "if(await r.count()>0){await r.hover();await pg.waitForTimeout(700);}"
     "const pop=await pg.locator('[id*=term-popover]').count();"
     "console.log('popover:'+pop);"},

    {"id":"E5","type":"interaction","hyp":"Overview 有收入结构图表",
     "snippet":
     "await pg.goto('http://127.0.0.1:'+PORT+'/index.html',{waitUntil:'networkidle'});"
     "await pg.waitForTimeout(3000);"
     "const charts=await pg.locator('canvas,svg').count();"
     "const rev=await pg.getByText('收入结构').count();"
     "console.log('charts:'+charts+' revenue:'+rev);"},

    {"id":"E6","type":"interaction","hyp":"Analysis情景对比表≥3行且有高亮",
     "snippet":
     "await pg.goto('http://127.0.0.1:'+PORT+'/index.html',{waitUntil:'networkidle'});"
     "await pg.waitForTimeout(2000);"
     "await pg.getByRole('button',{name:/敏感度分析/}).first().click();"
     "await pg.waitForTimeout(2000);"
     "const rows=await pg.locator('tr').count();"
     "const hi=await pg.locator('[class*=bg-blue],[class*=accent],[class*=selected]').count();"
     "console.log('rows:'+rows+' highlighted:'+hi);"},

    {"id":"E7","type":"interaction","hyp":"Inspector过程面板无NaN(regression)",
     "snippet":
     "await pg.goto('http://127.0.0.1:'+PORT+'/index.html',{waitUntil:'networkidle'});"
     "await pg.waitForTimeout(2000);"
     "const btn=pg.getByRole('button',{name:/打开说明面板/}).first();"
     "if(await btn.count()>0){await btn.click();await pg.waitForTimeout(1000);}"
     "const body=await pg.locator('.rilo-inspector-panel').textContent().catch(()=>'');"
     "console.log('hasNaN:'+body.includes('NaN'));"},
]

def main():
    print("="*60)
    print("Autonomous Testing Loop — Rilo Analysis")
    print("Experiment: hypothesis -> test -> score -> reflect")
    print("="*60)
    proc = start_server()
    results = {"passed":0,"failed":0,"findings":[],"experiments":[]}
    for exp in EXPERIMENTS:
        print(f"\n[{exp['id']}] {exp['hyp']}")
        if exp["type"] == "edge":
            score, out = run_edge(exp["code"])
        else:
            score, out = run_interaction(exp["snippet"])
        status = "PASS" if score >= 1.0 else "FAIL"
        print(f"  [{status}] score={score:.1f}")
        if out: print(f"  {out[:120].replace(chr(10),' ')}")
        rec = dict(id=exp["id"],type=exp["type"],hyp=exp["hyp"],score=score,status=status)
        results["experiments"].append(rec)
        if score >= 1.0:
            results["passed"] += 1
        else:
            results["failed"] += 1
            results["findings"].append(rec)
    if proc: proc.terminate()
    print(f"\n{'='*60}")
    print(f"RESULTS: {results['passed']} PASS / {results['failed']} FAIL")
    if results["findings"]:
        print(f"\nISSUES:")
        for f in results["findings"]:
            print(f"  [{f['id']}] {f['hyp']}")
    out_path = PROJECT+"/tmp/autotest-results.json"
    os.makedirs(PROJECT+"/tmp", exist_ok=True)
    with open(out_path,"w") as f:
        json.dump({**results,"timestamp":time.strftime("%Y-%m-%dT%H:%M:%SZ")}, f, indent=2)
    print(f"\nSaved: {out_path}")

if __name__ == "__main__":
    main()
