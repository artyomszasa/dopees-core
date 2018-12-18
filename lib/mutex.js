export class Mutex {
    constructor() {
        this.queue = [];
        this.active = false;
    }
    dispose() {
        for (let triggers = this.queue.shift(); triggers; triggers = this.queue.shift()) {
            triggers.reject('cancelled');
        }
    }
    lock() {
        return new Promise((resolve, reject) => {
            // this runs syncronously...
            if (this.active || this.queue.length) {
                this.queue.push({ resolve, reject });
            }
            else {
                this.active = true;
                resolve();
            }
        });
    }
    release() {
        // this runs syncronously...
        const triggers = this.queue.shift();
        if (triggers) {
            setTimeout(() => triggers.resolve(), 0);
        }
        else {
            this.active = false;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXV0ZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvbXV0ZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsTUFBTSxPQUFPLEtBQUs7SUFBbEI7UUFDbUIsVUFBSyxHQUFvRCxFQUFFLENBQUM7UUFDckUsV0FBTSxHQUFHLEtBQUssQ0FBQztJQTBCekIsQ0FBQztJQXpCQyxPQUFPO1FBQ0wsS0FBSyxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLFFBQVEsRUFBRSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRTtZQUMvRSxRQUFRLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1NBQzlCO0lBQ0gsQ0FBQztJQUNELElBQUk7UUFDRixPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQ3JDLDRCQUE0QjtZQUM1QixJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUU7Z0JBQ3BDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7YUFDdEM7aUJBQU07Z0JBQ0wsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7Z0JBQ25CLE9BQU8sRUFBRSxDQUFDO2FBQ1g7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFDRCxPQUFPO1FBQ0wsNEJBQTRCO1FBQzVCLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDcEMsSUFBSSxRQUFRLEVBQUU7WUFDWixVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQ3pDO2FBQU07WUFDTCxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztTQUNyQjtJQUNILENBQUM7Q0FDRiJ9