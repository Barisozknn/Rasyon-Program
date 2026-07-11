/**
 * Yem Fiyat Yöneticisi — FAZ 7B
 *
 * Tüm 201 yemi gösterir, kullanıcı fiyat girebilir (TL/ton yaş ağırlık),
 * toplu kayıt IndexedDB'ye yazılır → economics hesapları anında güncel olur.
 *
 * Türkiye 2026 referans fiyatları bir preset olarak sunulur.
 */

import { getAllFeeds, updateFeed, feedMatchesQuery } from '../../data/feedService.js';
import { FEED_CATEGORIES, CATEGORY_LABELS_TR } from '../../data/feedService.js';
import { TR_REGIONS, TR_REGION_IDS, adjustPriceForRegion, regionFlagshipFeeds } from '../../data/regionTemplates.js';
import { priceHistorySnapshot, priceHistoryGetByFeed, priceHistoryDeleteByFeed } from '../../data/db.js';
import { showToast, escHtml, fmt } from '../utils.js';
import { t } from '../i18n.js';

const catLabel = (cat) => { const k = `categories.${cat}`; const v = t(k); return v === k ? (CATEGORY_LABELS_TR[cat] || cat) : v; };

// ─── Türkiye 2026 referans fiyatları (TL/ton yaş ağırlık, Mayıs 2026) ───────
// Pazar koşullarına göre güncellenmeli; kullanıcı her zaman değiştirebilir.
// ID'ler feedLibrary.json / feedLibraryExt.json / feedLibraryExt2.json ile eşleştirildi.
const TR_REF_PRICES = {
  cvb_soybean_meal_44: 24600,
  feedipedia_cassava_leaf: 17600,
  inra_lucerne_hay_early: 11200,
  inra_maize_silage_30dm: 4610,
  inra_perennial_ryegrass_hay: 4900,
  inra_wheat_grain: 14700,
  min_3nop: 66300,
  min_activated_charcoal: 64600,
  min_ammonium_chloride: 3500,
  min_ammonium_sulfate: 84900,
  min_amylase_enzyme: 344600,
  min_anionic_salt_blend: 3600,
  min_bentonite: 64800,
  min_betaine: 66500,
  min_biotin: 1166100,
  min_bypass_fat_palmitic: 87300,
  min_calcified_seaweed: 66600,
  min_calcium_butyrate: 64700,
  min_calcium_chloride: 3500,
  min_calcium_formate: 65300,
  min_calcium_iodate: 65900,
  min_calcium_magnesium_carbonate: 65900,
  min_calcium_propionate: 63100,
  min_calcium_sulfate: 86500,
  min_choline_chloride: 63700,
  min_chromium_propionate: 66600,
  min_clinoptilolite: 15100,
  min_cobalt_carbonate: 64900,
  min_cobalt_sulfate: 86800,
  min_copper_oxide: 64800,
  min_copper_sulfate: 84600,
  min_defluorinated_phosphate: 32400,
  min_diammonium_phosphate: 32000,
  min_dicalcium_phosphate: 32500,
  min_dolomite: 64800,
  min_essential_oils: 84200,
  min_ferrous_carbonate: 66400,
  min_ferrous_sulfate: 83200,
  min_fibrolytic_enzyme: 359000,
  min_folic_acid: 63200,
  min_fumaric_acid: 64000,
  min_glucomannan_binder: 15100,
  min_hscas_binder: 14700,
  min_humic_acid: 78400,
  min_kelp_meal: 66000,
  min_lasalocid: 65900,
  min_limestone: 64400,
  min_live_yeast: 85800,
  min_magnesium_carbonate: 63700,
  min_magnesium_chloride: 66700,
  min_magnesium_hydroxide: 66800,
  min_magnesium_oxide: 17900,
  min_magnesium_phosphate: 31400,
  min_magnesium_sulfate: 3500,
  min_malic_acid: 64300,
  min_manganese_oxide: 63100,
  min_manganese_sulfate: 84000,
  min_mannan_oligo: 63700,
  min_methionine_hydroxy_analog: 65700,
  min_monensin: 65800,
  min_monoammonium_phosphate: 31400,
  min_monocalcium_phosphate: 31700,
  min_niacin: 63200,
  min_organic_cobalt: 64900,
  min_organic_copper: 63800,
  min_organic_iron: 66600,
  min_organic_manganese: 65700,
  min_organic_selenium: 85500,
  min_organic_zinc: 63800,
  min_oyster_shell: 64300,
  min_phosphoric_acid: 65500,
  min_potassium_bicarbonate: 63500,
  min_potassium_carbonate: 65600,
  min_potassium_chloride: 66600,
  min_potassium_iodide: 64600,
  min_potassium_magnesium_sulfate: 85200,
  min_potassium_sulfate: 87100,
  min_premix_dry_cow: 77000,
  min_premix_heifer: 79400,
  min_premix_lactation_std: 77200,
  min_premix_se_enriched: 79900,
  min_premix_transition: 79100,
  min_probiotic_dfm: 65800,
  min_propylene_glycol: 64900,
  min_protease_enzyme: 344700,
  min_pyridoxine_b6: 66200,
  min_riboflavin_b2: 1224900,
  min_rock_phosphate: 31700,
  min_rumen_protected_choline: 63400,
  min_rumen_protected_lysine: 64100,
  min_rumen_protected_methionine: 66200,
  min_salt_nacl: 3500,
  min_sodium_acetate: 66300,
  min_sodium_bicarbonate: 22400,
  min_sodium_butyrate: 63700,
  min_sodium_selenate: 63400,
  min_sodium_selenite: 77900,
  min_sodium_sesquicarbonate: 65400,
  min_sodium_sulfate: 86300,
  min_sodium_tripolyphosphate: 32300,
  min_steamed_bone_meal: 64000,
  min_tannin_extract: 65300,
  min_thiamine_b1: 65900,
  min_trace_mineral_premix: 76900,
  min_urea: 24400,
  min_vitamin_a: 859000,
  min_vitamin_ade: 841800,
  min_vitamin_b12: 1234100,
  min_vitamin_c: 862100,
  min_vitamin_d3: 871900,
  min_vitamin_e: 842600,
  min_vitamin_premix_ade: 76900,
  min_yeast_cell_wall: 85300,
  min_yeast_culture: 86700,
  min_yucca_saponin: 66500,
  min_zinc_methionine: 64200,
  min_zinc_oxide: 65400,
  min_zinc_sulfate: 86100,
  nrc_alfalfa_hay_1cut: 11200,
  nrc_alfalfa_hay_2cut: 11200,
  nrc_alfalfa_hay_3cut: 11200,
  nrc_beet_pulp_dried: 9700,
  nrc_beet_pulp_wet: 4610,
  nrc_bermuda_grass_hay: 4900,
  nrc_birdsfoot_trefoil_hay: 5100,
  nrc_blood_meal: 44700,
  nrc_brewers_grains_wet: 4610,
  nrc_calcium_soap_fat: 3600,
  nrc_cane_molasses: 8300,
  nrc_canola_meal: 15600,
  nrc_canola_meal_expeller: 15800,
  nrc_cassava: 13600,
  nrc_citrus_pulp_dried: 10100,
  nrc_corn_ddgs: 87400,
  nrc_corn_gluten_feed: 13800,
  nrc_corn_gluten_meal_40: 13400,
  nrc_corn_gluten_meal_60: 13700,
  nrc_corn_grain_coarse: 13500,
  nrc_corn_grain_dry_rolled: 13700,
  nrc_corn_grain_fine: 13600,
  nrc_corn_grain_whole: 13500,
  nrc_corn_silage_std: 4610,
  nrc_distillers_solubles_dried: 9900,
  nrc_feather_meal: 18100,
  nrc_fish_meal: 68400,
  nrc_grain_sorghum: 13900,
  nrc_grass_hay: 5100,
  nrc_high_moisture_corn: 13200,
  nrc_kentucky_bluegrass_hay: 5100,
  nrc_meat_bone_meal: 17900,
  nrc_oat_grain: 13300,
  nrc_peas_whole: 17700,
  nrc_poultry_byproduct_meal: 5100,
  nrc_prilled_fat: 84200,
  nrc_rye_grain: 13600,
  nrc_smooth_brome_hay: 5000,
  nrc_soybean_hulls: 17900,
  nrc_soybean_meal_44: 24200,
  nrc_soybean_meal_48: 24400,
  nrc_soybean_oil: 84800,
  nrc_steam_flaked_corn: 13100,
  nrc_tall_fescue_hay: 5100,
  nrc_tallow: 85800,
  nrc_timothy_hay: 5100,
  nrc_triticale_grain: 13400,
  nrc_wheat_grain: 14900,
  nrc_wheat_middlings: 11300,
  nrc_whole_soybean: 22500,
  tr_acorn: 13100,
  tr_alfalfa_haylage: 5800,
  tr_alfalfa_meal_dehydrated: 17500,
  tr_alfalfa_silage: 5800,
  tr_alfalfa_silage_early: 5800,
  tr_alfalfa_silage_late: 5800,
  tr_alfalfa_silage_wilted: 5800,
  tr_almond_hulls: 10100,
  tr_alsike_clover_hay: 5000,
  tr_apple_juice_pulp: 9800,
  tr_apple_pomace_dry: 10100,
  tr_apple_pomace_wet: 10000,
  tr_apricot_pomace: 10000,
  tr_bakery_waste: 9800,
  tr_banana_waste: 10100,
  tr_barley_bran: 14400,
  tr_barley_grain: 14500,
  tr_barley_pea_silage: 4610,
  tr_barley_rolled: 14100,
  tr_barley_silage_whole: 4610,
  tr_barley_steam_flaked: 14200,
  tr_barley_straw: 4200,
  tr_barley_whole: 14100,
  tr_beer_residue_wet: 9700,
  tr_beet_leaves: 10200,
  tr_beet_pulp_molassed: 8400,
  tr_beet_tops_silage: 4610,
  tr_beet_vinasse: 9800,
  tr_berseem_clover_hay: 5100,
  tr_biscuit_meal: 10300,
  tr_bovine_plasma: 17800,
  tr_brachiaria_hay: 5000,
  tr_brassica_forage: 15800,
  tr_bread_dried: 9800,
  tr_breakfast_cereal_waste: 9800,
  tr_brewers_rice: 10200,
  tr_brewers_yeast: 87000,
  tr_broken_rice: 10200,
  tr_buckwheat_grain: 15000,
  tr_buckwheat_hulls: 15400,
  tr_cabbage_waste: 10000,
  tr_calcium_salts_palm: 3500,
  tr_candy_byproduct: 10100,
  tr_cane_molasses_blackstrap: 8500,
  tr_canola_full_fat_roasted: 83200,
  tr_canola_hulls: 15400,
  tr_canola_meal: 15600,
  tr_canola_oil: 83900,
  tr_carob_meal: 12700,
  tr_carob_pods: 9800,
  tr_carrot_pulp: 9800,
  tr_carrot_tops: 10200,
  tr_cauliflower_waste: 9700,
  tr_cherry_pomace: 10100,
  tr_chestnut_dried: 13900,
  tr_chickpea: 18400,
  tr_chickpea_straw: 4200,
  tr_chocolate_byproduct: 10100,
  tr_clover_silage: 4610,
  tr_cocoa_meal: 12900,
  tr_cocoa_shells: 10100,
  tr_coconut_meal: 12700,
  tr_coconut_oil: 83500,
  tr_coffee_husks: 9800,
  tr_coffee_pulp: 10000,
  tr_condensed_distillers_solubles: 10300,
  tr_condensed_molasses_solubles: 8600,
  tr_confectionery_byproduct: 10100,
  tr_copra_meal: 13100,
  tr_corn_bran: 13700,
  tr_corn_ccm: 4610,
  tr_corn_ddgs_low_fat: 85600,
  tr_corn_flour_byproduct: 13600,
  tr_corn_germ_meal: 13600,
  tr_corn_grain_high_moisture: 13600,
  tr_corn_grain_rolled: 13500,
  tr_corn_oil: 83500,
  tr_corn_screenings: 13400,
  tr_corn_silage_early: 4610,
  tr_corn_silage_late: 4610,
  tr_corn_silage_mid: 4610,
  tr_corn_steep_liquor: 13200,
  tr_corn_stover: 13800,
  tr_cotton_stalks: 4500,
  tr_cottonseed_hulls: 9900,
  tr_cottonseed_meal: 12400,
  tr_cottonseed_meal_pressed: 12600,
  tr_cottonseed_meal_solvent: 12400,
  tr_cottonseed_oil: 83500,
  tr_cowpea_hay: 5100,
  tr_crimson_clover_hay: 5000,
  tr_dairy_concentrate_18: 18300,
  tr_dairy_concentrate_22: 18400,
  tr_date_byproduct: 10300,
  tr_distillers_dried_grains_wheat: 15200,
  tr_distillers_wheat_solubles: 15200,
  tr_distillers_yeast: 84400,
  tr_dried_apple_pomace: 9800,
  tr_dried_brewers_grains: 9800,
  tr_dried_whey: 9700,
  tr_dry_bean: 18400,
  tr_durum_wheat: 15000,
  tr_eggplant_waste: 10300,
  tr_emmer_grain: 13700,
  tr_extruded_soy: 85900,
  tr_faba_bean: 18100,
  tr_faba_bean_silage: 4610,
  tr_faba_bean_straw: 4200,
  tr_fenugreek_seed: 10100,
  tr_fescue_clover_mix_hay: 5100,
  tr_fig_waste: 10000,
  tr_fish_meal_anchovy: 66000,
  tr_fish_meal_menhaden: 67700,
  tr_fish_oil: 83800,
  tr_fish_silage: 4610,
  tr_flint_corn_ground: 13300,
  tr_foxtail_millet_grain: 13800,
  tr_fresh_alfalfa: 4500,
  tr_fresh_berseem: 4600,
  tr_fresh_corn: 13700,
  tr_fresh_meadow_grass: 4400,
  tr_fresh_perennial_ryegrass: 4600,
  tr_fresh_red_clover: 4500,
  tr_fresh_sorghum_sudan: 4500,
  tr_fresh_vetch: 4400,
  tr_fresh_white_clover: 4600,
  tr_glucose_syrup_byproduct: 9800,
  tr_glycerin_feed: 10300,
  tr_grain_screenings: 13300,
  tr_grain_sorghum_silage: 4610,
  tr_grape_pomace: 9800,
  tr_grapefruit_pulp: 10000,
  tr_grapeseed_meal: 13200,
  tr_grapeseed_oil: 86200,
  tr_grass_legume_silage: 4610,
  tr_grass_pea: 18500,
  tr_grass_silage: 4610,
  tr_green_barley: 14000,
  tr_green_bean_waste: 9800,
  tr_green_oats: 13900,
  tr_ground_corn_grain: 13600,
  tr_guar_meal: 13300,
  tr_hairy_vetch_hay: 4900,
  tr_hazelnut_meal: 87500,
  tr_hemp_seed_cake: 18400,
  tr_hemp_seed_meal: 13300,
  tr_high_oleic_sunflower_oil: 86700,
  tr_high_protein_ddg: 18000,
  tr_hominy_feed: 13500,
  tr_hulless_barley: 14500,
  tr_hydrogenated_fat: 83900,
  tr_hydrolyzed_feather_meal: 17800,
  tr_italian_ryegrass_hay: 5100,
  tr_italian_ryegrass_silage: 4610,
  tr_lablab_hay: 5100,
  tr_lemon_pulp_dried: 10200,
  tr_lentil_grain: 17500,
  tr_lentil_straw: 4200,
  tr_linseed_cake: 20200,
  tr_linseed_meal: 20000,
  tr_linseed_oil: 84400,
  tr_liquid_whey: 9800,
  tr_lupin_blue: 18200,
  tr_lupin_meal: 17900,
  tr_lupin_silage: 4610,
  tr_lupin_straw: 4200,
  tr_lupin_white: 17800,
  tr_lupin_yellow: 17500,
  tr_malt_culms: 10000,
  tr_malt_sprouts: 9900,
  tr_mango_waste: 9900,
  tr_meadow_hay_mixed: 4900,
  tr_meat_meal: 86600,
  tr_melon_waste: 9700,
  tr_millet_bran: 10100,
  tr_millet_silage: 4610,
  tr_millet_straw: 4200,
  tr_mineral_block: 65000,
  tr_mixed_legume_grass_hay: 11200,
  tr_mixed_vegetable_oil: 87300,
  tr_molasses_beet: 8500,
  tr_molasses_dried: 8600,
  tr_mung_bean: 18000,
  tr_mungbean_hay: 4500,
  tr_mushroom_substrate: 10000,
  tr_mustard_meal: 12900,
  tr_naked_oats: 13300,
  tr_napier_grass: 4400,
  tr_niger_seed_meal: 13200,
  tr_oat_bran: 13800,
  tr_oat_hay: 13800,
  tr_oat_pea_silage: 4610,
  tr_oat_silage: 4610,
  tr_oat_straw: 4200,
  tr_oats_rolled: 13200,
  tr_oats_whole: 13300,
  tr_olive_kernel_meal: 10000,
  tr_olive_leaves: 10100,
  tr_olive_oil_waste: 85400,
  tr_olive_pomace: 84700,
  tr_onion_waste: 10000,
  tr_orange_pulp_dried: 10300,
  tr_orchardgrass_hay: 5000,
  tr_palm_kernel_meal: 12900,
  tr_palm_kernel_oil: 82900,
  tr_palm_oil: 83400,
  tr_pasta_waste: 10300,
  tr_pea_pods: 9700,
  tr_pea_protein_concentrate: 17900,
  tr_pea_silage: 4610,
  tr_pea_straw: 4200,
  tr_peach_pomace: 10100,
  tr_peanut_hulls: 10200,
  tr_peanut_meal: 12700,
  tr_peanut_skins: 10000,
  tr_pearl_millet_grain: 13700,
  tr_pepper_pomace: 10100,
  tr_perennial_ryegrass: 4400,
  tr_perennial_ryegrass_silage: 4610,
  tr_pigeon_pea: 18300,
  tr_pineapple_pulp: 10200,
  tr_pistachio_hulls: 9700,
  tr_plum_pomace: 10300,
  tr_porcine_plasma: 17900,
  tr_potato_chips_waste: 10100,
  tr_potato_protein: 17600,
  tr_potato_pulp_dried: 10200,
  tr_potato_pulp_wet: 10000,
  tr_potato_skin: 9900,
  tr_potato_starch_byproduct: 10100,
  tr_poultry_blood_meal: 44700,
  tr_poultry_fat: 83300,
  tr_poultry_meal: 18400,
  tr_prairie_hay: 4900,
  tr_proso_millet_grain: 13300,
  tr_protein_concentrate_mix: 18200,
  tr_pumpkin_pulp: 10000,
  tr_pumpkin_seed_cake: 17900,
  tr_rapeseed_meal: 15500,
  tr_red_clover_hay: 5100,
  tr_reed_canary_hay: 5000,
  tr_rice_bran: 85800,
  tr_rice_bran_defatted: 84200,
  tr_rice_bran_oil: 84600,
  tr_rice_grain: 13900,
  tr_rice_hulls: 9900,
  tr_rice_polishings: 9900,
  tr_rice_protein_concentrate: 18300,
  tr_rock_salt: 3400,
  tr_rumen_protected_fat_blend: 87300,
  tr_rumen_protected_oleic: 85800,
  tr_rumen_protected_soybean: 24900,
  tr_rye_bran: 9700,
  tr_rye_silage: 4610,
  tr_rye_straw: 4200,
  tr_ryegrass_clover_hay: 4900,
  tr_ryegrass_clover_silage: 4610,
  tr_safflower_hulls: 10100,
  tr_safflower_meal: 13200,
  tr_safflower_meal_dehulled: 12700,
  tr_safflower_oil: 85600,
  tr_safflower_seed: 17500,
  tr_sainfoin_hay: 4900,
  tr_salt_lick_block: 3500,
  tr_sesame_cake: 17600,
  tr_sesame_hulls: 10200,
  tr_sesame_meal: 12900,
  tr_shrimp_meal: 17800,
  tr_snaplage: 4610,
  tr_soft_wheat_ground: 15100,
  tr_sorghum_bran: 9700,
  tr_sorghum_red_ground: 13100,
  tr_sorghum_rolled: 13800,
  tr_sorghum_silage: 4610,
  tr_sorghum_stalks: 4600,
  tr_sorghum_steam_flaked: 13300,
  tr_sorghum_sudan_silage: 4610,
  tr_sorghum_white_ground: 13500,
  tr_soy_molasses: 8600,
  tr_soybean_fermented: 24000,
  tr_soybean_hay: 5100,
  tr_soybean_meal_expeller: 25200,
  tr_soybean_meal_high_bypass: 24700,
  tr_soybean_meal_organic: 24900,
  tr_soybean_raw: 17700,
  tr_soybean_roasted: 18500,
  tr_soybean_straw: 4200,
  tr_spelt_grain: 13500,
  tr_spinach_waste: 10000,
  tr_spirulina: 18000,
  tr_starch_residue: 13100,
  tr_sudan_grass_hay: 5000,
  tr_sudan_grass_silage: 4610,
  tr_sugar_beet_pulp_silage: 4610,
  tr_sugarcane_bagasse: 10000,
  tr_sunflower_hulls: 9800,
  tr_sunflower_meal: 12700,
  tr_sunflower_meal_dehulled: 13200,
  tr_sunflower_meal_partial: 13100,
  tr_sunflower_oil: 87400,
  tr_sunflower_silage: 4610,
  tr_sweet_corn_silage: 4610,
  tr_sweet_potato_dried: 13400,
  tr_sweet_potato_vine: 4600,
  tr_tall_fescue_silage: 4610,
  tr_tea_waste: 9900,
  tr_tef_hay: 5000,
  tr_tomato_pomace: 9900,
  tr_torula_yeast: 86100,
  tr_treated_canola: 15100,
  tr_triticale_silage: 4610,
  tr_vetch_hay: 5100,
  tr_vetch_seed: 18300,
  tr_vetch_silage: 4610,
  tr_walnut_meal: 86600,
  tr_watermelon_rind: 9900,
  tr_waxy_corn_hmc: 13100,
  tr_wet_corn_gluten_feed: 13200,
  tr_wheat_bran: 15000,
  tr_wheat_ddgs: 14700,
  tr_wheat_germ: 15400,
  tr_wheat_gluten_vital: 15100,
  tr_wheat_grain_red: 14600,
  tr_wheat_red_dog: 15000,
  tr_wheat_rolled: 15000,
  tr_wheat_screenings: 15200,
  tr_wheat_shorts: 14900,
  tr_wheat_steam_flaked: 15000,
  tr_wheat_straw: 4200,
  tr_whey_protein_concentrate: 17900,
  tr_white_clover_hay: 5100,
  tr_white_corn_grain: 13200,
  tr_whole_cottonseed: 85600,
  tr_whole_crop_wheat_silage: 4610,
  tr_whole_flaxseed: 19900,
  tr_winery_pomace: 10300,
  tr_yellow_grease: 86200,
};

let _allFeeds = null;
let _pendingChanges = {};  // feedId → pricePerTon
let _filterCat = '';
let _filterSearch = '';

export async function renderPriceManager(container, state = null) {
  _state = state;   // FAZ 15.7: flagship yem önerisini Rasyon Kurucu'ya eklemek için
  container.innerHTML = `
    <!-- 📖 Sekme Yardımı -->
    <details class="tab-help-accordion" style="margin-bottom:0.75rem">
      <summary style="cursor:pointer; font-weight:600; color:var(--primary); display:flex; align-items:center; gap:0.4rem">
        <i class="ti ti-info-circle"></i> ${t('common.tab_help_title')} <span style="font-size:0.75rem; font-weight:400; color:var(--text-muted); margin-left:auto">▾</span>
      </summary>
      <div class="info-box" style="margin-top:0.5rem; font-size:0.85rem; line-height:1.7">
        ${t('tabHelp.prices')}
      </div>
    </details>

    <div class="card">
      <div class="card-title">${t('pm.title')}</div>
      <p class="text-muted" style="margin:0 0 12px">
        ${t('pm.intro')}
      </p>

      <div class="flex-between mb-2" style="flex-wrap:wrap;gap:8px">
        <div class="flex gap-1" style="flex-wrap:wrap">
          <input id="pm-search" type="search" class="search-input"
            placeholder="${t('pm.search_ph')}" style="min-width:180px" />
          <select id="pm-cat" class="btn btn-secondary btn-sm" style="padding:4px 8px">
            <option value="">${t('pm.all_cats')}</option>
            ${FEED_CATEGORIES.map(c => `<option value="${c}">${catLabel(c)}</option>`).join('')}
          </select>
        </div>
        <div class="flex gap-1" style="flex-wrap:wrap">
          <select id="pm-region" class="btn btn-secondary btn-sm" style="padding:4px 8px" title="${t('pm.region_title')}">
            <option value="">${t('pm.region_general')}</option>
            ${TR_REGION_IDS.map(rid => `<option value="${rid}">${TR_REGIONS[rid].name}</option>`).join('')}
          </select>
          <button class="btn btn-secondary btn-sm" id="btn-preset" title="${t('pm.tr_ref_title')}">
            ${t('pm.tr_ref')}
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-snapshot" title="${t('pm.snapshot_title')}">
            ${t('pm.snapshot')}
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-export-prices" title="Excel fiyat şablonu indir">
            <i class="ti ti-file-export"></i> Şablon
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-import-prices" title="Excel'den fiyatları yükle">
            <i class="ti ti-file-import"></i> Yükle
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-clear-prices">
            ${t('pm.reset')}
          </button>
          <button class="btn btn-primary btn-sm" id="btn-save-prices">
            ${t('pm.save')}
          </button>
        </div>
      </div>

      <div id="pm-pending-notice" class="info-box box-warn" style="display:none">
        ${t('pm.pending')}
      </div>

      <div id="pm-region-info" class="info-box box-info" style="display:none"></div>

      <div id="pm-table-wrap">
        <div class="empty-state"><div class="icon"><i class="ti ti-loader-2 ti-spin"></i></div><p>${t('pm.loading')}</p></div>
      </div>

      <div class="flex-between mt-2" style="font-size:13px;color:var(--text-muted)">
        <span id="pm-count"></span>
        <span id="pm-total-value"></span>
      </div>
    </div>

    <!-- FAZ 11A: Geçmiş modal (yem-bazlı fiyat geçmişi) -->
    <div id="pm-history-modal" style="display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:1000;align-items:center;justify-content:center">
      <div class="card" style="max-width:700px;max-height:80vh;overflow:auto;margin:1rem">
        <div class="flex-between">
          <div class="card-title" style="margin:0"><i class="ti ti-chart-bar"></i> <span id="pm-history-feedname"></span> — ${t('pm.history_title')}</div>
          <button class="btn btn-sm btn-secondary" id="btn-close-history">${t('pm.close')}</button>
        </div>
        <div id="pm-history-content" style="margin-top:1rem"></div>
      </div>
    </div>
  `;

  _pendingChanges = {};
  _filterCat = '';
  _filterSearch = '';

  try {
    _allFeeds = await getAllFeeds();
  } catch (err) {
    container.querySelector('#pm-table-wrap').innerHTML =
      `<div class="empty-state"><div class="icon"><i class="ti ti-alert-circle"></i></div><p>${t('pm.load_err')}${escHtml(err.message)}</p></div>`;
    return;
  }

  renderTable(container);

  // Input delegation — tek seferlik, renderTable çağrılarında birikmez
  container.querySelector('#pm-table-wrap').addEventListener('input', (e) => {
    if (!e.target.classList.contains('price-input')) return;
    const id = e.target.dataset.id;
    const val = parseFloat(e.target.value) || 0;
    _pendingChanges[id] = val;
    e.target.style.borderColor = '#f9a825';
    e.target.closest('tr').style.background = '#fffde7';
    container.querySelector('#pm-pending-notice').style.display = 'block';
    updateTotalValue(container);
  });

  container.querySelector('#pm-search').addEventListener('input', (e) => {
    _filterSearch = e.target.value;   // FAZ 15.10: ham değer; feedMatchesQuery normalize eder
    renderTable(container);
  });
  container.querySelector('#pm-cat').addEventListener('change', (e) => {
    _filterCat = e.target.value;
    renderTable(container);
  });

  container.querySelector('#btn-preset').addEventListener('click', () => {
    applyPreset(container);
  });
  container.querySelector('#btn-clear-prices').addEventListener('click', () => {
    clearAllPrices(container);
  });
  container.querySelector('#btn-save-prices').addEventListener('click', async () => {
    await savePrices(container);
  });
  container.querySelector('#btn-export-prices').addEventListener('click', () => {
    exportPriceTemplate();
  });
  container.querySelector('#btn-import-prices').addEventListener('click', () => {
    importPricesExcel(container);
  });

  // FAZ 11A: Bölge seçimi → preset uygula + info banner
  container.querySelector('#pm-region').addEventListener('change', (e) => {
    _selectedRegion = e.target.value || '';
    updateRegionInfo(container);
    if (_selectedRegion) {
      applyPreset(container);  // Bölge çarpanı otomatik dahil
    }
  });

  // FAZ 11A: Snapshot — şu anki fiyatları geçmişe kaydet
  container.querySelector('#btn-snapshot').addEventListener('click', async () => {
    await takeSnapshot(container);
  });

  // FAZ 11A: Tablo içinden "Geçmiş" linkine tıklayınca modal aç
  container.querySelector('#pm-table-wrap').addEventListener('click', async (e) => {
    if (!e.target.classList.contains('pm-history-link')) return;
    await openHistoryModal(container, e.target.dataset.id, e.target.dataset.name);
  });

  container.querySelector('#btn-close-history').addEventListener('click', () => {
    container.querySelector('#pm-history-modal').style.display = 'none';
  });

  updateRegionInfo(container);
}

// ─── FAZ 11A: Bölge bilgi bandı ─────────────────────────────────────────────
let _selectedRegion = '';
let _state = null;   // FAZ 15.7: Rasyon Kurucu'ya yem eklemek için global state

function updateRegionInfo(container) {
  const info = container.querySelector('#pm-region-info');
  if (!info) return;
  if (!_selectedRegion || !TR_REGIONS[_selectedRegion]) {
    info.style.display = 'none';
    return;
  }
  const r = TR_REGIONS[_selectedRegion];
  info.style.display = 'block';

  // FAZ 15.7: bölgenin öne çıkan (flagship) yemleri — bir tıkla Rasyon Kurucu'ya eklenir
  const flagshipFeeds = regionFlagshipFeeds(_selectedRegion)
    .map(id => _allFeeds.find(f => f.id === id))
    .filter(Boolean);

  info.innerHTML = `
    <b><i class="ti ti-map-pin"></i> ${escHtml(r.name)}</b> — ${escHtml(r.description)}<br>
    <span class="text-small">${t('pm.price_mult')}${r.priceMultiplier.toFixed(2)} ·
    ${escHtml(r.notes)}</span>
    ${flagshipFeeds.length ? `
      <div class="pm-flagship">
        <div class="pm-flagship-title">${t('pm.flagship_title')}${_state ? t('pm.flagship_add_hint') : ''}:</div>
        <div class="pm-flagship-list">
          ${flagshipFeeds.map(f => `
            <button class="pm-flagship-item ${_state ? '' : 'pm-flagship-static'}" data-feed-id="${escHtml(f.id)}"
              title="${escHtml(catLabel(f.category))}">
              <span class="pm-flagship-name">${escHtml(f.name)}</span>
              ${_state ? '<span class="pm-flagship-add"><i class="ti ti-plus"></i></span>' : ''}
            </button>`).join('')}
        </div>
      </div>` : ''}
  `;

  // FAZ 15.7: flagship yem → Rasyon Kurucu seçimine ekle
  if (_state) {
    info.querySelectorAll('.pm-flagship-item').forEach(btn => {
      btn.addEventListener('click', () => addFlagshipFeed(btn.dataset.feedId));
    });
  }
}

/** FAZ 15.7: bölge flagship yemini state.selectedFeeds'e ekler (Rasyon Kurucu). */
function addFlagshipFeed(feedId) {
  if (!_state) return;
  if (!Array.isArray(_state.selectedFeeds)) _state.selectedFeeds = [];
  const feed = _allFeeds.find(f => f.id === feedId);
  if (!feed) { showToast(t('pm.feed_not_found'), 'error'); return; }
  if (_state.selectedFeeds.some(sf => sf.id === feedId)) {
    showToast(t('pm.already_selected', { name: feed.name }), 'info');
    return;
  }
  _state.selectedFeeds.push({
    id: feed.id, name: feed.name, category: feed.category, minKg: null, maxKg: null,
  });
  showToast(t('pm.added_to_builder', { name: feed.name }), 'success');
}

// ─── FAZ 11A: Snapshot — geçerli fiyat seti tarihli kayıt ─────────────────
async function takeSnapshot(container) {
  // Önce kaydedilmemiş değişiklikler varsa uyar
  if (Object.keys(_pendingChanges).length > 0) {
    if (!confirm(t('pm.snap_confirm'))) return;
  }
  const note = prompt(t('pm.snap_note_prompt'), '') ?? '';
  try {
    const feedsWithPrice = _allFeeds.filter(f => Number(f.pricePerTon) > 0);
    if (feedsWithPrice.length === 0) {
      showToast(t('pm.snap_need_price'), 'error');
      return;
    }
    await priceHistorySnapshot(feedsWithPrice, _selectedRegion, note);
    showToast(t('pm.snap_done', { n: feedsWithPrice.length }), 'success');
  } catch (err) {
    console.error(err);
    showToast(t('pm.snap_err') + err.message, 'error');
  }
}

// ─── FAZ 11A: Geçmiş modal — yem-bazlı fiyat trendi ──────────────────────
async function openHistoryModal(container, feedId, feedName) {
  const modal = container.querySelector('#pm-history-modal');
  const titleEl = container.querySelector('#pm-history-feedname');
  const content = container.querySelector('#pm-history-content');
  if (!modal || !content) return;

  titleEl.textContent = feedName || feedId;
  modal.style.display = 'flex';
  content.innerHTML = `<p class="text-muted">${t('pm.loading')}</p>`;

  try {
    const history = await priceHistoryGetByFeed(feedId);
    if (history.length === 0) {
      content.innerHTML = `
        <div class="empty-state" style="padding:1.5rem">
          <p>${t('pm.hist_empty')}</p>
          <p class="text-small">${t('pm.hist_empty_hint')}</p>
        </div>`;
      return;
    }

    // Trend istatistikleri
    const prices = history.map(h => h.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = prices.reduce((s, p) => s + p, 0) / prices.length;
    const first = prices[0];
    const last = prices[prices.length - 1];
    const change = last - first;
    const changePct = first > 0 ? (change / first * 100) : 0;

    content.innerHTML = `
      <div class="summary-bar" style="grid-template-columns: repeat(4, 1fr); gap: 0.5rem">
        <div class="summary-card"><div class="val">${min.toLocaleString()}</div><div class="lbl">${t('pm.h_min')}</div></div>
        <div class="summary-card"><div class="val">${Math.round(avg).toLocaleString()}</div><div class="lbl">${t('pm.h_avg')}</div></div>
        <div class="summary-card"><div class="val">${max.toLocaleString()}</div><div class="lbl">${t('pm.h_max')}</div></div>
        <div class="summary-card" style="background:${change >= 0 ? 'var(--above-bg)' : 'var(--primary-light)'}">
          <div class="val" style="color:${change >= 0 ? 'var(--danger)' : 'var(--primary)'}">
            ${change > 0 ? '+' : ''}${changePct.toFixed(1)}%
          </div>
          <div class="lbl">${t('pm.h_firstlast')}</div>
        </div>
      </div>

      <table class="diag-table" style="margin-top:1rem">
        <thead>
          <tr><th>${t('pm.h_col_date')}</th><th class="num">${t('pm.h_col_price')}</th><th>${t('pm.h_col_region')}</th><th>${t('pm.h_col_note')}</th></tr>
        </thead>
        <tbody>
          ${history.map(h => `<tr>
            <td>${new Date(h.date).toLocaleDateString()}</td>
            <td class="num">${h.price.toLocaleString()}</td>
            <td>${TR_REGIONS[h.region]?.name || '—'}</td>
            <td class="text-muted">${escHtml(h.note || '')}</td>
          </tr>`).join('')}
        </tbody>
      </table>

      <div class="flex gap-1 mt-1">
        <button class="btn btn-sm btn-danger" id="btn-clear-history">${t('pm.clear_history')}</button>
      </div>
      <p class="text-small text-muted mt-1">
        ${t('pm.records_note', { n: history.length })}
      </p>
    `;

    content.querySelector('#btn-clear-history')?.addEventListener('click', async () => {
      if (!confirm(t('pm.confirm_clear_hist', { name: feedName }))) return;
      await priceHistoryDeleteByFeed(feedId);
      showToast(t('pm.history_cleared'), 'success');
      modal.style.display = 'none';
    });
  } catch (err) {
    content.innerHTML = `<div class="warn-box">${t('pm.load_err')}${escHtml(err.message)}</div>`;
  }
}

// ─── Excel Export/Import ─────────────────────────────────────────────────────

async function exportPriceTemplate() {
  try {
    const XLSX = await import('xlsx-js-style');
    const data = _allFeeds.map(f => ({
      'ID': f.id,
      'Yem Adı': f.name,
      'Kategori': catLabel(f.category),
      'Fiyat (₺/ton)': f.pricePerTon || 0
    }));
    const ws = XLSX.utils.json_to_sheet(data);

    // Sütun genişlikleri
    ws['!cols'] = [{ wch: 22 }, { wch: 45 }, { wch: 25 }, { wch: 18 }];

    // Tam Sabitleme (1. satır sabit) - Hata vermeyen format
    ws['!views'] = [{ state: 'frozen', xSplit: 0, ySplit: 1, topLeftCell: 'A2', activePane: 'bottomLeft' }];

    const range = XLSX.utils.decode_range(ws['!ref']);

    // Tasarım ve Renklendirme Döngüsü
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ c: C, r: R });
        const cell = ws[cellAddress];
        if (!cell) continue;

        const borderStyle = {
          top: { style: "thin", color: { rgb: "FFBFBFBF" } },
          bottom: { style: "thin", color: { rgb: "FFBFBFBF" } },
          left: { style: "thin", color: { rgb: "FFBFBFBF" } },
          right: { style: "thin", color: { rgb: "FFBFBFBF" } }
        };

        if (R === 0) {
          // Tablo Başlıkları
          cell.s = {
            fill: { fgColor: { rgb: "FF4F81BD" } },
            font: { bold: true, color: { rgb: "FFFFFFFF" } },
            alignment: { horizontal: "center", vertical: "center" },
            border: { ...borderStyle, bottom: { style: "medium", color: { rgb: "FF000000" } } }
          };
        } else {
          // Veri Satırları (Zebra deseni)
          const isEven = (R % 2 === 0);
          cell.s = {
            fill: { fgColor: { rgb: isEven ? "FFF2F2F2" : "FFFFFFFF" } },
            font: { color: { rgb: "FF000000" } },
            border: borderStyle,
            alignment: { vertical: "center" }
          };

          if (C === 3 && cell.t === 'n') {
            cell.z = '#,##0.00 "₺"';
          }
        }
      }
    }


    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Fiyatlar");
    XLSX.writeFile(wb, "yem_fiyat_sablonu.xlsx");
    showToast('Şablon indirildi. Fiyatları düzenleyip geri yükleyebilirsiniz.', 'info');
  } catch (err) {
    showToast('Dışa aktarma hatası: ' + err.message, 'error');
  }
}

async function importPricesExcel(container) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.xlsx, .xls, .csv';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const XLSX = await import('xlsx-js-style');
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = new Uint8Array(evt.target.result);
          const wb = XLSX.read(data, { type: 'array' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(ws);

          let updatedCount = 0;
          rows.forEach(row => {
            const id = row['ID'] || row['id'];
            const price = parseFloat(row['Fiyat (₺/ton)'] || row['Fiyat'] || row['price'] || row['Price']);

            if (id && !isNaN(price)) {
              // Yem listede var mı kontrolü
              const feedExists = _allFeeds.some(f => f.id === id);
              if (feedExists) {
                _pendingChanges[id] = price;
                updatedCount++;
              }
            }
          });

          if (updatedCount > 0) {
            showToast(`${updatedCount} yemin fiyatı içeri aktarıldı. Kaydetmeyi unutmayın!`, 'success');
            container.querySelector('#pm-pending-notice').style.display = 'block';
            renderTable(container);
            updateTotalValue(container);
          } else {
            showToast('Geçerli fiyat veya eşleşen ID bulunamadı.', 'warn');
          }
        } catch (err) {
          showToast('Dosya okunurken hata oluştu: ' + err.message, 'error');
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      showToast('İçe aktarma başlatılamadı: ' + err.message, 'error');
    }
  };
  input.click();
}

function renderTable(container) {
  const feeds = _allFeeds.filter(f => {
    if (_filterCat && f.category !== _filterCat) return false;
    // FAZ 15.10: Türkçe-toleranslı + typo toleranslı fuzzy arama (diğer arama yerleriyle tutarlı)
    if (_filterSearch && !feedMatchesQuery(f, _filterSearch)) return false;
    return true;
  });

  const wrap = container.querySelector('#pm-table-wrap');
  if (feeds.length === 0) {
    wrap.innerHTML = `<div class="empty-state"><div class="icon"><i class="ti ti-search"></i></div><p>${t('pm.no_match')}</p></div>`;
    container.querySelector('#pm-count').textContent = t('pm.n_feeds', { n: 0 });
    return;
  }

  // Kategoriye göre grupla
  const groups = {};
  for (const f of feeds) {
    (groups[f.category] = groups[f.category] || []).push(f);
  }

  let html = `
    <div style="overflow-x:auto">
    <table class="data-table" style="width:100%">
      <thead>
        <tr>
          <th style="text-align:left;min-width:200px">${t('pm.col_name')}</th>
          <th style="text-align:left;width:100px">${t('pm.col_cat')}</th>
          <th style="text-align:right;width:60px">${t('pm.col_dm')}</th>
          <th style="text-align:right;width:80px">${t('pm.col_nel')}</th>
          <th style="text-align:right;width:80px">${t('pm.col_cp')}</th>
          <th style="text-align:right;width:140px">${t('pm.col_price')}</th>
          <th style="text-align:center;width:80px">${t('pm.col_history')}</th>
        </tr>
      </thead>
      <tbody>
  `;

  for (const cat of FEED_CATEGORIES) {
    const list = groups[cat];
    if (!list) continue;
    html += `
      <tr style="background:var(--primary-light)">
        <td colspan="7" style="font-weight:700;padding:6px 8px;font-size:13px;color:var(--primary)">
          ${escHtml(catLabel(cat))} (${list.length})
        </td>
      </tr>
    `;
    for (const f of list) {
      const currentPrice = _pendingChanges[f.id] !== undefined
        ? _pendingChanges[f.id]
        : (f.pricePerTon || 0);
      const hasPending = _pendingChanges[f.id] !== undefined;
      html += `
        <tr data-feed-id="${escHtml(f.id)}" ${hasPending ? 'style="background:var(--below-bg)"' : ''}>
          <td>
            <div style="font-weight:500">${escHtml(f.name)}</div>
            ${f.nameEn ? `<div style="font-size:11px;color:var(--text-light)">${escHtml(f.nameEn)}</div>` : ''}
          </td>
          <td style="font-size:12px;color:var(--text-muted)">${escHtml(catLabel(f.category))}</td>
          <td style="text-align:right">${fmt(f.dm, 0)}%</td>
          <td style="text-align:right">${fmt(f.nel, 2)}</td>
          <td style="text-align:right">${fmt(f.cp, 1)}%</td>
          <td>
            <div class="flex" style="justify-content:flex-end;align-items:center;gap:4px">
              <input type="number" class="price-input" data-id="${escHtml(f.id)}"
                value="${currentPrice}"
                min="0" max="999999" step="100"
                style="width:90px;text-align:right;padding:3px 6px;border:1px solid ${hasPending ? '#f9a825' : '#ddd'};border-radius:4px;font-size:13px"
              />
              <span style="font-size:12px;color:var(--text-muted)">₺</span>
            </div>
          </td>
          <td style="text-align:center">
            <a href="#" class="pm-history-link" data-id="${escHtml(f.id)}" data-name="${escHtml(f.name)}"
               style="color:var(--primary,#2d5f4a);text-decoration:underline;font-size:12px"
               title="${t('pm.view_title')}">${t('pm.view')}</a>
          </td>
        </tr>
      `;
    }
  }

  html += `</tbody></table></div>`;
  wrap.innerHTML = html;

  container.querySelector('#pm-count').textContent = t('pm.n_shown', { n: feeds.length });
  updateTotalValue(container);
}

function updateTotalValue(container) {
  if (!_allFeeds) return;
  const totalWithPrices = _allFeeds.filter(f => {
    const p = _pendingChanges[f.id] !== undefined ? _pendingChanges[f.id] : f.pricePerTon;
    return p > 0;
  }).length;
  container.querySelector('#pm-total-value').textContent =
    t('pm.n_defined', { defined: totalWithPrices, total: _allFeeds.length });
}

function applyPreset(container) {
  if (!_allFeeds) return;
  let applied = 0;
  for (const f of _allFeeds) {
    const base = TR_REF_PRICES[f.id];
    if (!base) continue;
    // FAZ 11A: bölge seçiliyse fiyatı çarpana göre ayarla
    _pendingChanges[f.id] = _selectedRegion
      ? adjustPriceForRegion(base, _selectedRegion, f.category)
      : base;
    applied++;
  }
  const regionTxt = _selectedRegion
    ? t('pm.region_mult_incl', { name: TR_REGIONS[_selectedRegion]?.name })
    : '';
  showToast(t('pm.preset_applied', { n: applied, region: regionTxt }), 'info');
  renderTable(container);
  container.querySelector('#pm-pending-notice').style.display = 'block';
}

function clearAllPrices(container) {
  if (!_allFeeds) return;
  for (const f of _allFeeds) {
    _pendingChanges[f.id] = 0;
  }
  showToast(t('pm.all_reset'), 'info');
  renderTable(container);
  container.querySelector('#pm-pending-notice').style.display = 'block';
}

async function savePrices(container) {
  const ids = Object.keys(_pendingChanges);
  if (ids.length === 0) {
    showToast(t('pm.no_changes'), 'info');
    return;
  }

  const btn = container.querySelector('#btn-save-prices');
  btn.disabled = true;
  btn.textContent = t('pm.saving');

  try {
    let saved = 0;
    for (const id of ids) {
      const feed = _allFeeds.find(f => f.id === id);
      if (!feed) continue;
      await updateFeed(id, { pricePerTon: _pendingChanges[id] });
      feed.pricePerTon = _pendingChanges[id];
      saved++;
    }
    _pendingChanges = {};
    container.querySelector('#pm-pending-notice').style.display = 'none';
    showToast(t('pm.n_saved', { n: saved }), 'success');
    renderTable(container);
  } catch (err) {
    showToast(t('pm.save_err') + err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = t('pm.save');
  }
}
