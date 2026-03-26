// 宠物综合体经营测算小程序 v1.0
// 说明：
// - 单文件 React 组件，可在本地直接运行与编辑。
// - 所有关键参数均为可变量，可保存你自己的预设。
// - 参考了用户提供表格的口径：会员 / 寄养 / 医疗 / 零售餐饮社交 的四大收入，以及 固定成本 / 变动成本 分法；
// - 结果区展示：总营收、成本、利润、利润率、回本周期（年）。
// - 提供"一键套用样例参数（来自截图）"。

function App() {
  // ====== 加载本地存储数据 ======
  const loadFromLocalStorage = () => {
    try {
      const savedData = localStorage.getItem('hopefulFinanceData');
      if (savedData) {
        return JSON.parse(savedData);
      }
    } catch (error) {
      console.error('加载本地数据失败:', error);
    }
    return null;
  };

  // ====== 保存数据到本地存储 ======
  const saveToLocalStorage = (data) => {
    try {
      localStorage.setItem('hopefulFinanceData', JSON.stringify(data));
    } catch (error) {
      console.error('保存数据失败:', error);
    }
  };

  // 获取保存的数据
  const savedData = React.useMemo(() => loadFromLocalStorage(), []);

  // ====== 基础 ======
  const [currency, setCurrency] = React.useState((savedData && savedData.currency) || "¥");
  const [projectName, setProjectName] = React.useState((savedData && savedData.projectName) || "Hopeful 宠物综合体（示例）");

  // ====== 规模与运营假设 ======
  const [areaSqm, setAreaSqm] = React.useState((savedData && savedData.areaSqm) || 300); // 面积㎡
  const [daysPerYear, setDaysPerYear] = React.useState((savedData && savedData.daysPerYear) || 365);

  // ====== 收入（四大板块） ======
  // 1) 会员收入
  const [memberCount, setMemberCount] = React.useState((savedData && savedData.memberCount) || 1000);
  const [memberBasePct, setMemberBasePct] = React.useState((savedData && savedData.memberBasePct) || 60); // %
  const [memberBasePrice, setMemberBasePrice] = React.useState((savedData && savedData.memberBasePrice) || 2499);
  const [memberProPct, setMemberProPct] = React.useState((savedData && savedData.memberProPct) || 40); // %
  const [memberProPrice, setMemberProPrice] = React.useState((savedData && savedData.memberProPrice) || 4999);

  // 2) 寄养收入
  const [boardingRooms, setBoardingRooms] = React.useState((savedData && savedData.boardingRooms) || 20);
  const [boardingADR, setBoardingADR] = React.useState((savedData && savedData.boardingADR) || 400); // 平均房价/天
  const [boardingOcc, setBoardingOcc] = React.useState((savedData && savedData.boardingOcc) || 70); // 平均入住率 %（已含淡旺季）

  // 3) 医疗收入
  const [medicalBaseRevenue, setMedicalBaseRevenue] = React.useState((savedData && savedData.medicalBaseRevenue) || 2400000); // 年度总医疗营收基线
  const [medicalDiagPct, setMedicalDiagPct] = React.useState((savedData && savedData.medicalDiagPct) || 70); // 诊疗占比 %
  const [medicalValueAddPct, setMedicalValueAddPct] = React.useState((savedData && savedData.medicalValueAddPct) || 10); // 增值服务占比 %
  const [medicalProductPct, setMedicalProductPct] = React.useState((savedData && savedData.medicalProductPct) || 20); // 产品占比 %

  // 4) 零售/餐饮/社交收入
  const [retailRevenue, setRetailRevenue] = React.useState((savedData && savedData.retailRevenue) || 600000); // 零售
  const [cafeSocialRevenue, setCafeSocialRevenue] = React.useState((savedData && savedData.cafeSocialRevenue) || 375000); // 餐饮/社交

  // ====== 成本假设 ======
  // 固定成本（年）
  const [rentPerSqmPerDay, setRentPerSqmPerDay] = React.useState((savedData && savedData.rentPerSqmPerDay) || 2.5); // 租金 单位：¥/㎡/天
  const [propertyPerSqmPerMonth, setPropertyPerSqmPerMonth] = React.useState((savedData && savedData.propertyPerSqmPerMonth) || 39); // 物业 单位：¥/㎡/月（示例：300㎡*39*12≈140,400）
  const [cleaningOtherFixed, setCleaningOtherFixed] = React.useState((savedData && savedData.cleaningOtherFixed) || 300 * 0.45 * 365); // 保洁/安保/杂项等（按示例）
  const [staffCount, setStaffCount] = React.useState((savedData && savedData.staffCount) || 9);
  const [staffSalaryPerMonth, setStaffSalaryPerMonth] = React.useState((savedData && savedData.staffSalaryPerMonth) || 12000);
  const [hqFeePctOfRevenue, setHqFeePctOfRevenue] = React.useState((savedData && savedData.hqFeePctOfRevenue) || 8); // 总部/管理费按营收 %

  // 变动成本（与收入挂钩或年度绝对值）
  const [variableCostPct_Members, setVariableCostPct_Members] = React.useState((savedData && savedData.variableCostPct_Members) || 5); // 举例：会员权益履约、礼品物料等
  const [variableCostPct_Boarding, setVariableCostPct_Boarding] = React.useState((savedData && savedData.variableCostPct_Boarding) || 10); // 洗护/寄养耗材人力（可与房价含税逻辑区分）
  const [variableCostPct_Medical, setVariableCostPct_Medical] = React.useState((savedData && savedData.variableCostPct_Medical) || 30); // 医疗药品/耗材/分成等
  const [variableCostPct_Retail, setVariableCostPct_Retail] = React.useState((savedData && savedData.variableCostPct_Retail) || 55); // 商品进货成本（毛利≈45%）
  const [variableCostPct_Cafe, setVariableCostPct_Cafe] = React.useState((savedData && savedData.variableCostPct_Cafe) || 65); // 餐饮原料/社交活动成本

  const [utilitiesPerYear, setUtilitiesPerYear] = React.useState((savedData && savedData.utilitiesPerYear) || 240000); // 全店水电能耗（年度）
  const [miscVariableAnnual, setMiscVariableAnnual] = React.useState((savedData && savedData.miscVariableAnnual) || 48300); // 其他变动成本（年度）

  // ====== 初始投资（用于回本周期） ======
  const [fitoutCost, setFitoutCost] = React.useState((savedData && savedData.fitoutCost) || 3500 * 600); // 示例：3500/㎡ * 600㎡ 但实际面积用于经营核算是 areaSqm=300（截图注释中：装修≈210万）
  const [medicalInitial, setMedicalInitial] = React.useState((savedData && savedData.medicalInitial) || 600000); // 医疗初始投入（设备+耗材首批）

  // ====== 计算 ======
  const memberRevenue = React.useMemo(() => {
    const baseMembers = (memberCount * memberBasePct) / 100;
    const proMembers = (memberCount * memberProPct) / 100;
    return baseMembers * memberBasePrice + proMembers * memberProPrice;
  }, [memberCount, memberBasePct, memberBasePrice, memberProPct, memberProPrice]);

  const boardingRevenue = React.useMemo(() => {
    const occ = Math.min(Math.max(boardingOcc, 0), 100) / 100;
    return boardingRooms * boardingADR * daysPerYear * occ;
  }, [boardingRooms, boardingADR, daysPerYear, boardingOcc]);

  const medicalRevenue = React.useMemo(() => {
    // 三段占比之和不必强行=100，按比例摊分显示即可；总医疗营收仍以 medicalBaseRevenue 为准
    const totalPct = medicalDiagPct + medicalValueAddPct + medicalProductPct;
    const diag = (medicalBaseRevenue * medicalDiagPct) / (totalPct || 1);
    const valueAdd = (medicalBaseRevenue * medicalValueAddPct) / (totalPct || 1);
    const prod = (medicalBaseRevenue * medicalProductPct) / (totalPct || 1);
    return diag + valueAdd + prod;
  }, [medicalBaseRevenue, medicalDiagPct, medicalValueAddPct, medicalProductPct]);

  const retailCafeRevenue = retailRevenue + cafeSocialRevenue;

  const totalRevenue = memberRevenue + boardingRevenue + medicalRevenue + retailCafeRevenue;

  // 固定成本
  const rentAnnual = areaSqm * rentPerSqmPerDay * daysPerYear;
  const propertyAnnual = areaSqm * propertyPerSqmPerMonth * 12;
  const staffAnnual = staffCount * staffSalaryPerMonth * 12;
  const hqFeeAnnual = (totalRevenue * hqFeePctOfRevenue) / 100;
  const fixedCostTotal = rentAnnual + propertyAnnual + cleaningOtherFixed + staffAnnual + hqFeeAnnual;

  // 变动成本
  const vMembers = (memberRevenue * variableCostPct_Members) / 100;
  const vBoarding = (boardingRevenue * variableCostPct_Boarding) / 100;
  const vMedical = (medicalRevenue * variableCostPct_Medical) / 100;
  const vRetail = (retailRevenue * variableCostPct_Retail) / 100;
  const vCafe = (cafeSocialRevenue * variableCostPct_Cafe) / 100;
  const variableCostTotal = vMembers + vBoarding + vMedical + vRetail + vCafe + utilitiesPerYear + miscVariableAnnual;

  const totalCost = fixedCostTotal + variableCostTotal;
  const profit = totalRevenue - totalCost;
  const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

  const initialInvestment = fitoutCost + medicalInitial;
  const paybackYears = profit > 0 ? initialInvestment / profit : Infinity;
  
  // ====== 保存数据 ======
  // 当任何数据变化时，保存到本地存储
  React.useEffect(() => {
    const dataToSave = {
      currency,
      projectName,
      areaSqm,
      daysPerYear,
      memberCount,
      memberBasePct,
      memberBasePrice,
      memberProPct,
      memberProPrice,
      boardingRooms,
      boardingADR,
      boardingOcc,
      medicalBaseRevenue,
      medicalDiagPct,
      medicalValueAddPct,
      medicalProductPct,
      retailRevenue,
      cafeSocialRevenue,
      rentPerSqmPerDay,
      propertyPerSqmPerMonth,
      cleaningOtherFixed,
      staffCount,
      staffSalaryPerMonth,
      hqFeePctOfRevenue,
      variableCostPct_Members,
      variableCostPct_Boarding,
      variableCostPct_Medical,
      variableCostPct_Retail,
      variableCostPct_Cafe,
      utilitiesPerYear,
      miscVariableAnnual,
      fitoutCost,
      medicalInitial
    };
    saveToLocalStorage(dataToSave);
  }, [
    currency, projectName, areaSqm, daysPerYear, memberCount, memberBasePct, memberBasePrice,
    memberProPct, memberProPrice, boardingRooms, boardingADR, boardingOcc, medicalBaseRevenue,
    medicalDiagPct, medicalValueAddPct, medicalProductPct, retailRevenue, cafeSocialRevenue,
    rentPerSqmPerDay, propertyPerSqmPerMonth, cleaningOtherFixed, staffCount, staffSalaryPerMonth,
    hqFeePctOfRevenue, variableCostPct_Members, variableCostPct_Boarding, variableCostPct_Medical,
    variableCostPct_Retail, variableCostPct_Cafe, utilitiesPerYear, miscVariableAnnual,
    fitoutCost, medicalInitial
  ]);

  // ====== 套用"截图示例"参数 ======
  const applyPreset = () => {
    setProjectName("Hopeful 宠物综合体（截图示例）");
    setAreaSqm(300);
    setDaysPerYear(365);

    setMemberCount(1000);
    setMemberBasePct(60);
    setMemberBasePrice(2499);
    setMemberProPct(40);
    setMemberProPrice(4999);

    setBoardingRooms(20);
    setBoardingADR(400);
    setBoardingOcc(70);

    setMedicalBaseRevenue(2400000);
    setMedicalDiagPct(70);
    setMedicalValueAddPct(10);
    setMedicalProductPct(20);

    setRetailRevenue(600000);
    setCafeSocialRevenue(375000);

    setRentPerSqmPerDay(2.5);
    setPropertyPerSqmPerMonth(39); // 300㎡*39*12 ≈ 140,400
    setCleaningOtherFixed(300 * 0.45 * 365); // ≈ 49,275（与截图口径接近"保洁/物管等"中的一项）
    setStaffCount(9);
    setStaffSalaryPerMonth(12000);
    setHqFeePctOfRevenue(8);

    setVariableCostPct_Members(5);
    setVariableCostPct_Boarding(10);
    setVariableCostPct_Medical(30); // 医疗成本率可按77%整体理解，这里留给用户微调
    setVariableCostPct_Retail(55);
    setVariableCostPct_Cafe(65);

    setUtilitiesPerYear(240000);
    setMiscVariableAnnual(48300);

    setFitoutCost(2100000); // 装修≈210万（3500*600 的口径在图注中）
    setMedicalInitial(600000);
  };

  // ====== UI 元件 ======
  const NumberInput = ({ label, value, onChange, step = 1, hint, suffix = "" }) => {
    // 使用字符串状态来避免输入框失去焦点问题
    const [inputValue, setInputValue] = React.useState(value.toString());
    
    // 当外部value变化时更新内部状态
    React.useEffect(() => {
      setInputValue(value.toString());
    }, [value]);
    
    // 处理输入变化
    const handleChange = (e) => {
      const newValue = e.target.value;
      setInputValue(newValue);
      
      // 只有当输入是有效数字时才更新父组件状态
      if (newValue !== '' && !isNaN(Number(newValue))) {
        onChange(Number(newValue));
      }
    };
    
    return (
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-600">{label}</label>
        <input
          type="number"
          className="px-3 py-2 rounded-xl border w-full"
          value={inputValue}
          step={step}
          onChange={handleChange}
          title={label}
          aria-label={label}
        />
        {hint ? <div className="text-xs text-gray-400">{hint}</div> : null}
      </div>
    );
  };

  const Section = ({ title, children, right }) => (
    <div className="bg-white rounded-2xl shadow p-4 lg:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        {right}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>
    </div>
  );

  const KPI = ({ label, value, strong, unit = "" }) => (
    <div className="p-4 bg-white rounded-2xl shadow text-center">
      <div className="text-sm text-gray-500 mb-2">{label}</div>
      <div className={`text-2xl ${strong ? "font-extrabold" : "font-semibold"}`}>{value}{unit}</div>
    </div>
  );

  // ====== 数字格式 ======
  const fmt = (n) =>
    n === Infinity || Number.isNaN(n)
      ? "—"
      : `${currency}${(Math.round(n)).toLocaleString()}`;

  const pct = (n) => `${n.toFixed(2)}%`;

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-gray-100 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        <header className="flex flex-col lg:flex-row lg:items-end gap-3 lg:gap-6">
          <div className="flex-1">
            <h1 className="text-2xl lg:text-3xl font-bold">宠物综合体经营测算</h1>
            <p className="text-gray-500 text-sm lg:text-base mt-1">可变参数 · 即时计算 · 适合路演与物业/投资沟通</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <input
              className="px-3 py-2 rounded-xl border"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              title="项目名称"
              placeholder="输入项目名称"
              aria-label="项目名称"
            />
            <select
              className="px-3 py-2 rounded-xl border"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              title="货币单位"
              aria-label="货币单位"
            >
              <option value="¥">人民币 ¥</option>
              <option value="$">USD $</option>
            </select>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={applyPreset}
                className="px-3 py-2 rounded-xl bg-black text-white hover:opacity-90"
                title="一键套用截图参数"
              >
                套用截图参数
              </button>
              <button
                onClick={() => {
                  try {
                    localStorage.removeItem('hopefulFinanceData');
                    alert('数据已清除，刷新页面后将恢复默认值');
                  } catch (error) {
                    console.error('清除数据失败:', error);
                    alert('清除数据失败');
                  }
                }}
                className="px-3 py-2 rounded-xl bg-red-500 text-white hover:opacity-90 text-sm"
                title="清除本地保存的数据"
              >
                清除保存数据
              </button>
            </div>
          </div>
        </header>

        {/* 结果区 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <KPI label="总营收 (年)" value={fmt(totalRevenue)} strong />
          <KPI label="固定成本 (年)" value={fmt(fixedCostTotal)} />
          <KPI label="变动成本 (年)" value={fmt(variableCostTotal)} />
          <KPI label="总成本 (年)" value={fmt(totalCost)} />
          <KPI label="年度利润" value={fmt(profit)} strong />
          <KPI label="利润率" value={pct(margin)} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Section title="规模与运营" right={<div className="text-sm text-gray-500">{projectName}</div>}>
            <NumberInput label="营业面积 (㎡)" value={areaSqm} onChange={setAreaSqm} />
            <NumberInput label="营业天数/年" value={daysPerYear} onChange={setDaysPerYear} />
          </Section>

          <Section title="会员收入">
            <NumberInput label="会员数 (人)" value={memberCount} onChange={setMemberCount} />
            <NumberInput label="基础会员占比 %" value={memberBasePct} onChange={setMemberBasePct} />
            <NumberInput label="基础会员价格" value={memberBasePrice} onChange={setMemberBasePrice} />
            <NumberInput label="高级会员占比 %" value={memberProPct} onChange={setMemberProPct} />
            <NumberInput label="高级会员价格" value={memberProPrice} onChange={setMemberProPrice} />
            <div className="col-span-full text-sm text-gray-500">年度会员收入：<b>{fmt(memberRevenue)}</b></div>
          </Section>

          <Section title="寄养收入">
            <NumberInput label="可售房间数" value={boardingRooms} onChange={setBoardingRooms} />
            <NumberInput label="平均房价/天" value={boardingADR} onChange={setBoardingADR} />
            <NumberInput label="平均入住率 %" value={boardingOcc} onChange={setBoardingOcc} />
            <div className="col-span-full text-sm text-gray-500">年度寄养收入：<b>{fmt(boardingRevenue)}</b></div>
          </Section>

          <Section title="医疗收入">
            <NumberInput label="医疗营收基线(年)" value={medicalBaseRevenue} onChange={setMedicalBaseRevenue} />
            <NumberInput label="诊疗占比 %" value={medicalDiagPct} onChange={setMedicalDiagPct} />
            <NumberInput label="增值服务占比 %" value={medicalValueAddPct} onChange={setMedicalValueAddPct} />
            <NumberInput label="产品占比 %" value={medicalProductPct} onChange={setMedicalProductPct} />
            <div className="col-span-full text-sm text-gray-500">年度医疗收入：<b>{fmt(medicalRevenue)}</b></div>
          </Section>

          <Section title="零售 / 餐饮 / 社交 收入">
            <NumberInput label="零售收入(年)" value={retailRevenue} onChange={setRetailRevenue} />
            <NumberInput label="餐饮/社交收入(年)" value={cafeSocialRevenue} onChange={setCafeSocialRevenue} />
            <div className="col-span-full text-sm text-gray-500">年度零售/餐饮/社交收入：<b>{fmt(retailCafeRevenue)}</b></div>
          </Section>

          <Section title="固定成本 (年)">
            <NumberInput label="租金 ¥/㎡/天" value={rentPerSqmPerDay} onChange={setRentPerSqmPerDay} />
            <NumberInput label="物业 ¥/㎡/月" value={propertyPerSqmPerMonth} onChange={setPropertyPerSqmPerMonth} />
            <NumberInput label="保洁/安保/杂项(年)" value={cleaningOtherFixed} onChange={setCleaningOtherFixed} />
            <NumberInput label="员工人数" value={staffCount} onChange={setStaffCount} />
            <NumberInput label="人均月薪" value={staffSalaryPerMonth} onChange={setStaffSalaryPerMonth} />
            <NumberInput label="总部/管理费 % (按营收)" value={hqFeePctOfRevenue} onChange={setHqFeePctOfRevenue} />
            <div className="col-span-full text-sm text-gray-500">固定成本小计：<b>{fmt(fixedCostTotal)}</b>（含总部按营收计提 {hqFeePctOfRevenue}%）</div>
          </Section>

          <Section title="变动成本 (年)">
            <NumberInput label="会员成本率 %" value={variableCostPct_Members} onChange={setVariableCostPct_Members} />
            <NumberInput label="寄养成本率 %" value={variableCostPct_Boarding} onChange={setVariableCostPct_Boarding} />
            <NumberInput label="医疗成本率 %" value={variableCostPct_Medical} onChange={setVariableCostPct_Medical} />
            <NumberInput label="零售进货成本率 %" value={variableCostPct_Retail} onChange={setVariableCostPct_Retail} />
            <NumberInput label="餐饮/社交成本率 %" value={variableCostPct_Cafe} onChange={setVariableCostPct_Cafe} />
            <NumberInput label="水电能耗(年)" value={utilitiesPerYear} onChange={setUtilitiesPerYear} />
            <NumberInput label="其他变动(年)" value={miscVariableAnnual} onChange={setMiscVariableAnnual} />
            <div className="col-span-full text-sm text-gray-500">变动成本小计：<b>{fmt(variableCostTotal)}</b></div>
          </Section>

          <Section title="初始投资 & 回本期">
            <NumberInput label="装修投入" value={fitoutCost} onChange={setFitoutCost} />
            <NumberInput label="医疗初始投入" value={medicalInitial} onChange={setMedicalInitial} />
            <div className="col-span-full grid grid-cols-2 gap-4">
              <KPI label="初始投资合计" value={fmt(initialInvestment)} strong />
              <KPI label="回本周期 (年)" value={paybackYears === Infinity ? "—" : paybackYears.toFixed(2)} />
            </div>
          </Section>
        </div>

        {/* 收入&成本拆解表 */}
        <div className="bg-white rounded-2xl shadow p-4 lg:p-6">
          <h2 className="text-lg font-semibold mb-4">收入 & 成本拆解</h2>
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-4">项目</th>
                  <th className="py-2 pr-4">收入</th>
                  <th className="py-2 pr-4">成本率/参数</th>
                  <th className="py-2 pr-4">变动成本</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 pr-4">会员</td>
                  <td className="py-2 pr-4">{fmt(memberRevenue)}</td>
                  <td className="py-2 pr-4">{variableCostPct_Members}%</td>
                  <td className="py-2 pr-4">{fmt(vMembers)}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-4">寄养</td>
                  <td className="py-2 pr-4">{fmt(boardingRevenue)}</td>
                  <td className="py-2 pr-4">{variableCostPct_Boarding}%</td>
                  <td className="py-2 pr-4">{fmt(vBoarding)}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-4">医疗</td>
                  <td className="py-2 pr-4">{fmt(medicalRevenue)}</td>
                  <td className="py-2 pr-4">{variableCostPct_Medical}%</td>
                  <td className="py-2 pr-4">{fmt(vMedical)}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-4">零售</td>
                  <td className="py-2 pr-4">{fmt(retailRevenue)}</td>
                  <td className="py-2 pr-4">{variableCostPct_Retail}%</td>
                  <td className="py-2 pr-4">{fmt(vRetail)}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-4">餐饮/社交</td>
                  <td className="py-2 pr-4">{fmt(cafeSocialRevenue)}</td>
                  <td className="py-2 pr-4">{variableCostPct_Cafe}%</td>
                  <td className="py-2 pr-4">{fmt(vCafe)}</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">水电 & 其他变动</td>
                  <td className="py-2 pr-4">—</td>
                  <td className="py-2 pr-4">—</td>
                  <td className="py-2 pr-4">{fmt(utilitiesPerYear + miscVariableAnnual)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
            <KPI label="固定成本合计" value={fmt(fixedCostTotal)} />
            <KPI label="变动成本合计" value={fmt(variableCostTotal)} />
            <KPI label="年度利润 (收入-成本)" value={fmt(profit)} strong />
          </div>
        </div>

        <footer className="text-center text-xs text-gray-500 pt-4 pb-8">
          © {new Date().getFullYear()} 经营测算模型 · 可编辑参数仅作教学与估算用途，请结合真实成本与税费校准。
        </footer>
      </div>
    </div>
  );
}