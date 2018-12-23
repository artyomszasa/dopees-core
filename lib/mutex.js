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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXV0ZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvbXV0ZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsTUFBTSxPQUFPLEtBQUs7SUFBbEI7UUFDbUIsVUFBSyxHQUFvRCxFQUFFLENBQUM7UUFDckUsV0FBTSxHQUFHLEtBQUssQ0FBQztJQTBCekIsQ0FBQztJQXpCQyxPQUFPO1FBQ0wsS0FBSyxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLFFBQVEsRUFBRSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRTtZQUMvRSxRQUFRLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1NBQzlCO0lBQ0gsQ0FBQztJQUNELElBQUk7UUFDRixPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQ3JDLDRCQUE0QjtZQUM1QixJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUU7Z0JBQ3BDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7YUFDdEM7aUJBQU07Z0JBQ0wsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7Z0JBQ25CLE9BQU8sRUFBRSxDQUFDO2FBQ1g7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFDRCxPQUFPO1FBQ0wsNEJBQTRCO1FBQzVCLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDcEMsSUFBSSxRQUFRLEVBQUU7WUFDWixVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQ3pDO2FBQU07WUFDTCxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztTQUNyQjtJQUNILENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERpc3Bvc2FibGUgfSBmcm9tIFwiLi9kaXNwb3NhYmxlXCI7XG5cbmV4cG9ydCBjbGFzcyBNdXRleCBpbXBsZW1lbnRzIERpc3Bvc2FibGUge1xuICBwcml2YXRlIHJlYWRvbmx5IHF1ZXVlIDogQXJyYXk8eyByZXNvbHZlOiBGdW5jdGlvbiwgcmVqZWN0OiBGdW5jdGlvbiB9PiA9IFtdO1xuICBwcml2YXRlIGFjdGl2ZSA9IGZhbHNlO1xuICBkaXNwb3NlICgpIHtcbiAgICBmb3IgKGxldCB0cmlnZ2VycyA9IHRoaXMucXVldWUuc2hpZnQoKTsgdHJpZ2dlcnM7IHRyaWdnZXJzID0gdGhpcy5xdWV1ZS5zaGlmdCgpKSB7XG4gICAgICB0cmlnZ2Vycy5yZWplY3QoJ2NhbmNlbGxlZCcpO1xuICAgIH1cbiAgfVxuICBsb2NrICgpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgLy8gdGhpcyBydW5zIHN5bmNyb25vdXNseS4uLlxuICAgICAgaWYgKHRoaXMuYWN0aXZlIHx8IHRoaXMucXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMucXVldWUucHVzaCh7IHJlc29sdmUsIHJlamVjdCB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIHJlbGVhc2UgKCkge1xuICAgIC8vIHRoaXMgcnVucyBzeW5jcm9ub3VzbHkuLi5cbiAgICBjb25zdCB0cmlnZ2VycyA9IHRoaXMucXVldWUuc2hpZnQoKTtcbiAgICBpZiAodHJpZ2dlcnMpIHtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4gdHJpZ2dlcnMucmVzb2x2ZSgpLCAwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5hY3RpdmUgPSBmYWxzZTtcbiAgICB9XG4gIH1cbn0iXX0=