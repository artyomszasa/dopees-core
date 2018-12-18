export function using(disposable, action) {
    try {
        return action(disposable);
    }
    finally {
        disposable.dispose();
    }
}
export async function asyncUsing(disposable, action) {
    try {
        return await action(disposable);
    }
    finally {
        disposable.dispose();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlzcG9zYWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9kaXNwb3NhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUtBLE1BQU0sVUFBVSxLQUFLLENBQTBCLFVBQWEsRUFBRSxNQUFxQjtJQUNqRixJQUFJO1FBQ0YsT0FBTyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7S0FDM0I7WUFBUztRQUNSLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUN0QjtBQUNILENBQUM7QUFFRCxNQUFNLENBQUMsS0FBSyxVQUFVLFVBQVUsQ0FBMEIsVUFBYSxFQUFFLE1BQThCO0lBQ3JHLElBQUk7UUFDRixPQUFPLE1BQU0sTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0tBQ2pDO1lBQVM7UUFDUixVQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDdEI7QUFDSCxDQUFDIn0=