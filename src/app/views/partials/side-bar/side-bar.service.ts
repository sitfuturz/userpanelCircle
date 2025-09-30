import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class SideBarService {
  constructor(private router: Router) {}
  ngOnInit(): void {}

  list: any[] = [
    {
      moduleName: 'GBS Customer Portal',
      menus: [
        {
           title: 'Recommendation',
           link: 'referrals',
           icon: 'corner-up-right',
        },
        {
          title: 'Business Received',
          link: 'tyfcbslip',
          icon: 'trending-up',
        },
        {
          title:'Member Directory',
          link:'member',
        icon:'user'    },
        {
          title: 'Endorsement',
          link: 'gratitude',
          icon: 'user-plus',
        },
        {
          title: 'Business Meeting',
          link: 'growth-meet',
          icon: 'file-import',
        },
        {
          title: 'Events',
          link: 'event',
          icon: 'calendar',
        },
        {
          title: 'Attendance',
          link: 'attendance',
          icon: 'check-circle',
        },
        {
          title: 'Leaderboard',
          link: 'leaderboard',
          icon: 'award',
        },

      ],
    },
  ];

  isMobile: boolean = false;
  activeSubMenuIndex: number | null = null;

  toggleSubMenu(index: number) {
    if (this.activeSubMenuIndex === index) {
      this.activeSubMenuIndex = null;
    } else {
      this.activeSubMenuIndex = index;
    }

  }

  navigateWithQueryParams(submenu: any) {
    this.router.navigate([submenu.link], { queryParams: submenu.queryParams });
  }

  onNavSwitch(item: string) {
    this.router.navigateByUrl(`/${item}`);
  }
}