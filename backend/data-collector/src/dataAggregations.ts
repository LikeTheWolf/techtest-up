//every nth document granularity for faster loading
export const aggregationPipelineImproved = (everyNth?: number, lastNRecords?: number): any[] => {
  const pipeline = [];

  pipeline.push(
    { $sort: { timestamp: 1 } },
  );

  //Filter documents where the timestamp is every nth minute, if `everyNth` is provided
  if (everyNth !== null && everyNth !== undefined) {
    pipeline.push({
      $match: {
        $expr: {
          // Extract the minute from the timestamp and check if it's divisible by `everyNth`
          $eq: [{ $mod: [{ $minute: "$timestamp" }, everyNth] }, 0],
        },
      },
    });
  }

  pipeline.push(
    { $unwind: "$regions" },
  );

  pipeline.push(
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
  );


  pipeline.push(
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
  );

  pipeline.push(
    { $sort: { timestamp: 1 } },
  );

  pipeline.push(
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
  );

  // Slice the arrays to keep only the last N elements
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

  // Remove _id at the final stage to avoid redundancy
  pipeline.push({
    $project: { _id: 0 },
  }); 

  return pipeline;   
}; 