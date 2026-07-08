// mockDemographics.js
// ──────────────────────────────────────────────────────────────────────────────
// Constituency Infrastructure & Demographic Dataset
// 
// DATA SOURCES:
//   • Synthetic Mock Data — Generated for demonstration purposes
//   • Represents approximate demographics for Lucknow zones
//   • NOT based on actual verifiable census or government surveys.
//
// METHODOLOGY:
//   Infrastructure Gap Score (0-100) is computed as:
//     gapScore = w1*(100 - tapWaterPct) + w2*(100 - pavedRoadPct) 
//              + w3*(schoolDeficit) + w4*(healthFacilityDeficit) + w5*(powerCutFreq)
//   where w1=0.25, w2=0.20, w3=0.20, w4=0.20, w5=0.15
//   Higher score = worse infrastructure relative to population needs.
//
// NOTE: Zone boundaries are approximated polygons over Lucknow Municipal 
//   Corporation wards. Real ward shapefiles are available from the Lucknow
//   Nagar Nigam GIS portal and Census India spatial databases.
// ──────────────────────────────────────────────────────────────────────────────

export const constituencyWards = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        name: "Hazratganj — Central Business District",
        wardNumbers: "42, 43, 44",
        population: 48520,
        households: 9840,
        literacyRate: 88.4,
        tapWaterCoverage: 82,
        pavedRoadCoverage: 91,
        schoolsPer10k: 4.2,
        phcDistance_km: 1.1,
        gapScore: 22,
        notes: "Well-developed commercial core. Mock data indicates 88.4% literacy, 82% tap water coverage. Low infrastructure gap — primary issues are traffic congestion and legacy drainage.",
        dataSources: "Synthetic Demonstration Data"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [80.940, 26.850], [80.955, 26.850],
          [80.955, 26.840], [80.940, 26.840],
          [80.940, 26.850]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "Aminabad — Old City Core",
        wardNumbers: "35, 36, 37, 38",
        population: 62300,
        households: 12100,
        literacyRate: 74.1,
        tapWaterCoverage: 58,
        pavedRoadCoverage: 62,
        schoolsPer10k: 3.1,
        phcDistance_km: 2.4,
        gapScore: 68,
        notes: "Dense old-city settlement. Mock data shows only 58% tap water and 62% paved roads. High population density (>35,000/km²) strains existing infrastructure. Schools deficit of ~1.1 per 10k vs. city average.",
        dataSources: "Synthetic Demonstration Data"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [80.930, 26.850], [80.940, 26.850],
          [80.940, 26.842], [80.930, 26.842],
          [80.930, 26.850]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "Aliganj — North Zone",
        wardNumbers: "1, 2, 3, 4, 5",
        population: 89200,
        households: 18400,
        literacyRate: 81.6,
        tapWaterCoverage: 71,
        pavedRoadCoverage: 68,
        schoolsPer10k: 3.8,
        phcDistance_km: 2.8,
        gapScore: 52,
        notes: "Large residential zone. Mock data shows 71% tap water, 68% paved roads. Rapidly growing. PHC distance (2.8 km) exceeds general targets of 1.5 km.",
        dataSources: "Synthetic Demonstration Data"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [80.935, 26.870], [80.960, 26.870],
          [80.960, 26.855], [80.935, 26.855],
          [80.935, 26.870]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "Chinhat — Eastern Peri-Urban",
        wardNumbers: "90, 91, 92, 93",
        population: 54800,
        households: 10200,
        literacyRate: 68.3,
        tapWaterCoverage: 34,
        pavedRoadCoverage: 41,
        schoolsPer10k: 2.3,
        phcDistance_km: 4.6,
        gapScore: 88,
        notes: "Rapidly urbanizing peri-urban area. Mock data: only 34% tap water, 41% paved roads. Critical education gap — 2.3 schools per 10k vs. national urban avg of 4.0. Nearest PHC 4.6 km away, well above 1.5 km norm.",
        dataSources: "Synthetic Demonstration Data"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [80.960, 26.855], [80.980, 26.855],
          [80.980, 26.838], [80.960, 26.838],
          [80.960, 26.855]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "Gomti Nagar — Planned Township",
        wardNumbers: "70, 71, 72, 73, 74",
        population: 72500,
        households: 16800,
        literacyRate: 91.2,
        tapWaterCoverage: 89,
        pavedRoadCoverage: 94,
        schoolsPer10k: 5.1,
        phcDistance_km: 0.8,
        gapScore: 15,
        notes: "Modern planned township, best infrastructure in city. Mock data: 91.2% literacy, 89% tap water, 94% paved roads. Well above general benchmarks for urban areas.",
        dataSources: "Synthetic Demonstration Data"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [80.955, 26.840], [80.975, 26.840],
          [80.975, 26.828], [80.955, 26.828],
          [80.955, 26.840]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "Rajajipuram — Western Industrial",
        wardNumbers: "55, 56, 57, 58, 59",
        population: 68100,
        households: 13500,
        literacyRate: 76.8,
        tapWaterCoverage: 62,
        pavedRoadCoverage: 59,
        schoolsPer10k: 2.9,
        phcDistance_km: 3.1,
        gapScore: 64,
        notes: "Industrial-residential mixed zone. Mock data: 62% tap water, 59% paved roads. Sanitation coverage below 60%. Schools per 10k (2.9) below city average (3.8). Factory pollution increases health burden.",
        dataSources: "Synthetic Demonstration Data"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [80.910, 26.855], [80.935, 26.855],
          [80.935, 26.840], [80.910, 26.840],
          [80.910, 26.855]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "Madiaon — North-West Fringe",
        wardNumbers: "8, 9, 10, 11",
        population: 41200,
        households: 7600,
        literacyRate: 64.5,
        tapWaterCoverage: 28,
        pavedRoadCoverage: 35,
        schoolsPer10k: 1.9,
        phcDistance_km: 5.2,
        gapScore: 93,
        notes: "CRITICAL GAP: Fringe area with worst infrastructure in constituency. Mock data: 28% tap water (vs city avg 67%), 35% paved roads. Only 1.9 schools per 10k. Nearest health facility 5.2 km away.",
        dataSources: "Synthetic Demonstration Data"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [80.910, 26.875], [80.935, 26.875],
          [80.935, 26.858], [80.910, 26.858],
          [80.910, 26.875]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "Alambagh — Southern Transport Hub",
        wardNumbers: "80, 81, 82, 83",
        population: 55600,
        households: 11200,
        literacyRate: 79.3,
        tapWaterCoverage: 65,
        pavedRoadCoverage: 72,
        schoolsPer10k: 3.4,
        phcDistance_km: 1.9,
        gapScore: 45,
        notes: "Major transport hub (railway station zone). Mock data: 65% tap water, 72% paved roads. Infrastructure adequate but strained by floating population. Sanitation near station area is a persistent concern.",
        dataSources: "Synthetic Demonstration Data"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [80.930, 26.840], [80.950, 26.840],
          [80.950, 26.828], [80.930, 26.828],
          [80.930, 26.840]
        ]]
      }
    }
  ]
};

// ──────────────────────────────────────────────────────────────────────────────
// Spatial lookup: Point-in-Polygon test to map complaint lat/lng → zone data
// Uses ray-casting algorithm
// ──────────────────────────────────────────────────────────────────────────────
export function getInfraGapForLocation(lat, lng) {
  for (const feature of constituencyWards.features) {
    const poly = feature.geometry.coordinates[0];
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const px = poly[i][0], py = poly[i][1];
      const pjx = poly[j][0], pjy = poly[j][1];
      
      const intersect = ((py > lat) !== (pjy > lat))
          && (lng < (pjx - px) * (lat - py) / (pjy - py) + px);
      if (intersect) inside = !inside;
    }
    if (inside) {
      return { 
        score: feature.properties.gapScore, 
        zone: feature.properties.name,
        population: feature.properties.population,
        tapWater: feature.properties.tapWaterCoverage,
        literacy: feature.properties.literacyRate,
        schools: feature.properties.schoolsPer10k,
        notes: feature.properties.notes
      };
    }
  }
  // Default fallback for complaints outside mapped zones
  return { 
    score: 50, 
    zone: "Unmapped Zone (Lucknow periphery)", 
    population: null,
    tapWater: null,
    literacy: null,
    schools: null,
    notes: "Outside mapped synthetic ward boundaries. District average gap score applied." 
  };
}
