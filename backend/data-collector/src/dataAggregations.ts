//every nth document granularity for faster loading
export const aggregationPipeline = (everyNth?: number, lastNRecords?: number): any[] => {
  const pipeline: any[] = [
    // Step 1: Unwind the 'regions' array
    { $unwind: "$regions" },

    // Step 2: Group data by timestamp and prepare objects for each key
    {
      $group: {
        _id: "$timestamp",
        servers_count: {
          $push: {
            k: { $replaceAll: { input: "$regions.region", find: "-", replacement: "_" } }, // replace '-' with '_'
            v: "$regions.results.stats.servers_count",
          },
        },
        online: {
          $push: {
            k: { $replaceAll: { input: "$regions.region", find: "-", replacement: "_" } },
            v: "$regions.results.stats.online",
          },
        },
        session: {
          $push: {
            k: { $replaceAll: { input: "$regions.region", find: "-", replacement: "_" } },
            v: "$regions.results.stats.session",
          },
        },
        active_connections: {
          $push: {
            k: { $replaceAll: { input: "$regions.region", find: "-", replacement: "_" } },
            v: "$regions.results.stats.server.active_connections",
          },
        },
        wait_time: {
          $push: {
            k: { $replaceAll: { input: "$regions.region", find: "-", replacement: "_" } },
            v: "$regions.results.stats.server.wait_time",
          },
        },
        cpu_load: {
          $push: {
            k: { $replaceAll: { input: "$regions.region", find: "-", replacement: "_" } },
            v: "$regions.results.stats.server.cpu_load",
          },
        },
      },
    },

    // Step 3: Convert arrays of key-value pairs into objects for each metric
    {
      $project: {
        _id: 0,
        timestamp: "$_id",
        servers_count: { $arrayToObject: "$servers_count" },
        online: { $arrayToObject: "$online" },
        session: { $arrayToObject: "$session" },
        active_connections: { $arrayToObject: "$active_connections" },
        wait_time: { $arrayToObject: "$wait_time" },
        cpu_load: { $arrayToObject: "$cpu_load" },
      },
    },

    // Step 4: Sort by timestamp in ascending order
    { $sort: { timestamp: 1 } },

    // Step 5: Group by keys to separate them into individual documents
    {
      $group: {
        _id: null,
        servers_count: {
          $push: {
            $mergeObjects: [{ timestamp: "$timestamp" }, "$servers_count"], // Use $mergeObjects to flatten the data
          },
        },
        online: {
          $push: {
            $mergeObjects: [{ timestamp: "$timestamp" }, "$online"],
          },
        },
        session: {
          $push: {
            $mergeObjects: [{ timestamp: "$timestamp" }, "$session"],
          },
        },
        active_connections: {
          $push: {
            $mergeObjects: [{ timestamp: "$timestamp" }, "$active_connections"],
          },
        },
        wait_time: {
          $push: {
            $mergeObjects: [{ timestamp: "$timestamp" }, "$wait_time"],
          },
        },
        cpu_load: {
          $push: {
            $mergeObjects: [{ timestamp: "$timestamp" }, "$cpu_load"],
          },
        },
      },
    },
  ];

  // Step 6: Slice the arrays to keep only the last 100 elements
  if (lastNRecords !== null && lastNRecords !== undefined) {
    const sliceNum = lastNRecords * -1;
    pipeline.push({
      $project: {
        servers_count: { $slice: ["$servers_count", sliceNum] },
        online: { $slice: ["$online", sliceNum] },
        session: { $slice: ["$session", sliceNum] },
        active_connections: { $slice: ["$active_connections", sliceNum] },
        wait_time: { $slice: ["$wait_time", sliceNum] },
        cpu_load: { $slice: ["$cpu_load", sliceNum] },
      },
    });
  }

  // Conditionally add the filtering stage based on the everyNth parameter
  if (everyNth !== null && everyNth !== undefined) {
    pipeline.push({
      $project: {
        servers_count: {
          $filter: {
            input: "$servers_count",
            as: "item",
            cond: {
              $eq: [{ $mod: [{ $indexOfArray: ["$servers_count", "$$item"] }, everyNth] }, 0],
            },
          },
        },
        online: {
          $filter: {
            input: "$online",
            as: "item",
            cond: {
              $eq: [{ $mod: [{ $indexOfArray: ["$online", "$$item"] }, everyNth] }, 0],
            },
          },
        },
        session: {
          $filter: {
            input: "$session",
            as: "item",
            cond: {
              $eq: [{ $mod: [{ $indexOfArray: ["$session", "$$item"] }, everyNth] }, 0],
            },
          },
        },
        active_connections: {
          $filter: {
            input: "$active_connections",
            as: "item",
            cond: {
              $eq: [{ $mod: [{ $indexOfArray: ["$active_connections", "$$item"] }, everyNth] }, 0],
            },
          },
        },
        wait_time: {
          $filter: {
            input: "$wait_time",
            as: "item",
            cond: {
              $eq: [{ $mod: [{ $indexOfArray: ["$wait_time", "$$item"] }, everyNth] }, 0],
            },
          },
        },
        cpu_load: {
          $filter: {
            input: "$cpu_load",
            as: "item",
            cond: {
              $eq: [{ $mod: [{ $indexOfArray: ["$cpu_load", "$$item"] }, everyNth] }, 0],
            },
          },
        },
      },
    });
  }

  // Remove _id at the final stage to avoid redundancy
  pipeline.push({
    $project: { _id: 0 },
  }); 

  return pipeline;   
};   