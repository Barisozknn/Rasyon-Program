const fs = require('fs');
const file = 'src/ui/components/dashboardPanel.js';
let data = fs.readFileSync(file, 'utf8');

const newCalc = `
  // Sürü-ölçek IOFC tahmini — Çiftlik Panelindeki profillere atalı rasyonları topla
  let iofcEstimate = null;
  let totalAssignedDailyIOFC = 0;
  let totalAssignedCows = 0;
  let totalAssignedMilkYield = 0;

  if (profiles && profiles.length > 0) {
    profiles.forEach(p => {
      const groupSize = groups.find(g => g.id === p.groupId)?.animalCount ?? 0;
      if (groupSize === 0) return;

      if (p.targetRationId) {
        const ration = rations.find(r => r.id === p.targetRationId);
        if (ration && ration.result?.feasible) {
          const econ = calcEconomics({
            milkYield_kg: p.milkYield ?? 0,
            milkPrice_tl: milkPrice,
            feedCost_tl_day: ration.result.totalCost ?? 0,
            dmi_kg: ration.result.dmi?.achieved_kg ?? 0,
            milkFat_pct: p.milkFat,
            milkProtein_pct: p.milkProtein,
            herdSize: 1
          });
          totalAssignedDailyIOFC += econ.daily.iofc_tl * groupSize;
          totalAssignedMilkYield += (p.milkYield ?? 0) * groupSize;
          totalAssignedCows += groupSize;
        }
      }
    });
  }

  // Eğer çiftlik panelinde en az 1 hayvan için atalı rasyon varsa onu kullan
  if (totalAssignedCows > 0) {
    const avgPerCow = totalAssignedDailyIOFC / totalAssignedCows;
    const avgMilk = totalAssignedMilkYield / totalAssignedCows;
    const mockEcon = calcEconomics({
      milkYield_kg: avgMilk,
      milkPrice_tl: milkPrice,
      feedCost_tl_day: (avgMilk * milkPrice) - avgPerCow, // status hesaplaması için
      dmi_kg: 20, 
      herdSize: 1
    });

    iofcEstimate = {
      perCow: avgPerCow,
      herd: totalAssignedDailyIOFC,
      monthly: totalAssignedDailyIOFC * 30,
      annual: totalAssignedDailyIOFC * 365,
      status: mockEcon.status,
      assignedCows: totalAssignedCows
    };
  } else if (lastResult?.feasible && totalAnimals > 0) {
    // Çiftlik panelinde hiç rasyon ataması yoksa eski mantık fallback (tekil son optimize edilen rasyon x toplam hayvan)
    const econ = calcEconomics({
      milkYield_kg: lastAnimal.milkYield ?? 0,
      milkPrice_tl: milkPrice,
      feedCost_tl_day: lastResult.totalCost ?? 0,
      dmi_kg: lastResult.dmi?.achieved_kg ?? 0,
      milkFat_pct: lastAnimal.milkFat,
      milkProtein_pct: lastAnimal.milkProtein,
      herdSize: totalAnimals,
    });
    iofcEstimate = {
      perCow: econ.daily.iofc_tl,
      herd: econ.herd.dailyIOFC_tl,
      monthly: econ.herd.monthlyIOFC_tl,
      annual: econ.herd.annualIOFC_tl,
      status: econ.status,
      assignedCows: totalAnimals
    };
  }
`;

const targetCalc1 = `  // Sürü-ölçek IOFC tahmini — mevcut rasyon × toplam hayvan
  let iofcEstimate = null;
  if (lastResult?.feasible && totalAnimals > 0) {
    const econ = calcEconomics({
      milkYield_kg: lastAnimal.milkYield ?? 0,
      milkPrice_tl: milkPrice,
      feedCost_tl_day: lastResult.totalCost ?? 0,
      dmi_kg: lastResult.dmi?.achieved_kg ?? 0,
      milkFat_pct: lastAnimal.milkFat,
      milkProtein_pct: lastAnimal.milkProtein,
      herdSize: totalAnimals,
    });
    iofcEstimate = {
      perCow: econ.daily.iofc_tl,
      herd: econ.herd.dailyIOFC_tl,
      monthly: econ.herd.monthlyIOFC_tl,
      annual: econ.herd.annualIOFC_tl,
      status: econ.status,
    };
  }`;

// normalize strings for replacement
data = data.replace(targetCalc1.replace(/\r\n/g, '\n'), newCalc.replace(/\r\n/g, '\n'));
data = data.replace(targetCalc1, newCalc);


// Now update the render function to use assignedCows
const oldRender = `        \${t('dashboard.status_label')}: <b style="color:\${statusColor}">\${escHtml(iofc.status.label)}</b>
        &middot; \${t('dashboard.based_on', { n: totalAnimals })}
      </div>
      <div class="text-small text-muted mt-1" style="line-height:1.4">
        Tahmin: mevcut rasyon &times; toplam hayvan sayısı. Farklı dönemler için Çiftlik Paneli sekmesini kullanın.
      </div>`;

const newRender = `        \${t('dashboard.status_label')}: <b style="color:\${statusColor}">\${escHtml(iofc.status.label)}</b>
        &middot; \${t('dashboard.based_on', { n: iofc.assignedCows || totalAnimals })}
      </div>
      <div class="text-small text-muted mt-1" style="line-height:1.4">
        Tahmin: \${iofc.assignedCows && iofc.assignedCows < totalAnimals 
          ? \`Çiftlik panelinde rasyon atanmış (\${iofc.assignedCows}/\${totalAnimals}) hayvan sayısı üzerinden hesaplandı.\` 
          : 'Çiftlik panelindeki tüm hayvan profillerinin atalı rasyon maliyetleri toplanarak hesaplandı.'}
      </div>`;

data = data.replace(oldRender.replace(/\r\n/g, '\n'), newRender.replace(/\r\n/g, '\n'));
data = data.replace(oldRender, newRender);

fs.writeFileSync(file, data, 'utf8');
console.log('Fixed IOFC calculation logic!');
