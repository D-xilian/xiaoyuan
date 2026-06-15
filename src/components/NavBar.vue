<template>
  <header class="navbar">
    <div class="navbar-container">
      <!-- Logo -->
      <div class="navbar-logo">
        <router-link to="/">
          <span class="logo-icon">🎓</span>
          <span class="logo-text">校园活动平台</span>
        </router-link>
      </div>

      <!-- 桌面端导航菜单 -->
      <nav class="navbar-nav">
        <ul class="nav-links">
          <!-- 首页 -->
          <li class="nav-item">
            <router-link to="/" class="nav-link" active-class="active">首页</router-link>
          </li>

          <!-- 管理员菜单 -->
          <li class="nav-item dropdown" v-if="isLoggedIn && isAdmin">
            <button class="nav-link dropdown-toggle">
              管理中心
              <span class="dropdown-arrow">▼</span>
            </button>
            <ul class="dropdown-menu">
              <li><router-link to="/admin/dashboard" class="dropdown-item">数据仪表盘</router-link></li>
              <li><router-link to="/admin/users" class="dropdown-item">用户管理</router-link></li>
              <li><router-link to="/admin/volunteers" class="dropdown-item">志愿者管理</router-link></li>
              <li><router-link to="/admin/activities" class="dropdown-item">活动管理</router-link></li>
              <li><router-link to="/registration/list" class="dropdown-item">报名管理</router-link></li>
              <li><router-link to="/activity/create" class="dropdown-item">创建活动</router-link></li>
            </ul>
          </li>

          <!-- 普通用户菜单 -->
          <li class="nav-item dropdown" v-if="isLoggedIn && !isAdmin">
            <button class="nav-link dropdown-toggle">
              活动服务
              <span class="dropdown-arrow">▼</span>
            </button>
            <ul class="dropdown-menu">
              <li><router-link to="/activity/register" class="dropdown-item">报名活动</router-link></li>
              <li><router-link to="/volunteer/recruitment" class="dropdown-item">志愿者招募</router-link></li>
              <li><router-link to="/my-join" class="dropdown-item">我的报名</router-link></li>
            </ul>
          </li>

          <!-- 未登录状态 -->
          <li class="nav-item" v-if="!isLoggedIn">
            <router-link to="/login" class="nav-link" active-class="active">登录</router-link>
          </li>
          <li class="nav-item" v-if="!isLoggedIn">
            <router-link to="/register" class="nav-link" active-class="active">注册</router-link>
          </li>

          <!-- 已登录状态 -->
          <li class="nav-item" v-if="isLoggedIn">
            <router-link to="/profile" class="nav-link" active-class="active">个人中心</router-link>
          </li>
          <li class="nav-item" v-if="isLoggedIn">
            <NotificationBell />
          </li>
          <li class="nav-item" v-if="isLoggedIn">
            <button @click="logout" class="nav-link logout-btn">退出登录</button>
          </li>
        </ul>
      </nav>

      <!-- 移动端菜单按钮 -->
      <button class="navbar-toggle" @click="toggleMobileMenu">
        <span class="toggle-bar"></span>
        <span class="toggle-bar"></span>
        <span class="toggle-bar"></span>
      </button>
    </div>

    <!-- 移动端菜单 -->
    <div class="mobile-menu" :class="{ active: isMobileMenuOpen }">
      <ul class="mobile-links">
        <li><router-link to="/" class="mobile-link" @click="closeMobileMenu">首页</router-link></li>
        
        <!-- 管理员菜单 -->
        <li v-if="isLoggedIn && isAdmin" class="mobile-dropdown">
          <button class="mobile-dropdown-toggle" @click="toggleAdminMobileMenu">
            管理中心 ▼
          </button>
          <ul class="mobile-dropdown-menu" :class="{ active: isAdminMobileMenuOpen }">
            <li><router-link to="/admin/dashboard" class="mobile-dropdown-item" @click="closeMobileMenu">数据仪表盘</router-link></li>
            <li><router-link to="/admin/users" class="mobile-dropdown-item" @click="closeMobileMenu">用户管理</router-link></li>
            <li><router-link to="/admin/volunteers" class="mobile-dropdown-item" @click="closeMobileMenu">志愿者管理</router-link></li>
            <li><router-link to="/admin/activities" class="mobile-dropdown-item" @click="closeMobileMenu">活动管理</router-link></li>
            <li><router-link to="/registration/list" class="mobile-dropdown-item" @click="closeMobileMenu">报名管理</router-link></li>
            <li><router-link to="/activity/create" class="mobile-dropdown-item" @click="closeMobileMenu">创建活动</router-link></li>
          </ul>
        </li>

        <!-- 普通用户菜单 -->
        <li v-if="isLoggedIn && !isAdmin" class="mobile-dropdown">
          <button class="mobile-dropdown-toggle" @click="toggleUserMobileMenu">
            活动服务 ▼
          </button>
          <ul class="mobile-dropdown-menu" :class="{ active: isUserMobileMenuOpen }">
            <li><router-link to="/activity/register" class="mobile-dropdown-item" @click="closeMobileMenu">报名活动</router-link></li>
            <li><router-link to="/volunteer/recruitment" class="mobile-dropdown-item" @click="closeMobileMenu">志愿者招募</router-link></li>
            <li><router-link to="/my-join" class="mobile-dropdown-item" @click="closeMobileMenu">我的报名</router-link></li>
          </ul>
        </li>

        <!-- 未登录状态 -->
        <li v-if="!isLoggedIn"><router-link to="/login" class="mobile-link" @click="closeMobileMenu">登录</router-link></li>
        <li v-if="!isLoggedIn"><router-link to="/register" class="mobile-link" @click="closeMobileMenu">注册</router-link></li>

        <!-- 已登录状态 -->
        <li v-if="isLoggedIn"><router-link to="/profile" class="mobile-link" @click="closeMobileMenu">个人中心</router-link></li>
        <li v-if="isLoggedIn"><button @click="logout" class="mobile-link logout-btn">退出登录</button></li>
      </ul>
    </div>
  </header>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import NotificationBell from './NotificationBell.vue';

export default {
  name: 'NavBar',
  components: {
    NotificationBell
  },
  setup() {
    const isLoggedIn = ref(false);
    const isAdmin = ref(false);
    const isMobileMenuOpen = ref(false);
    const isAdminMobileMenuOpen = ref(false);
    const isUserMobileMenuOpen = ref(false);
    const router = useRouter();

    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      const user = localStorage.getItem('user');
      isLoggedIn.value = !!token || !!user;
      isAdmin.value = role === 'admin';
      if (!role && user) {
        try {
          const userData = JSON.parse(user);
          isAdmin.value = userData.role === 'admin';
        } catch (e) {
          isAdmin.value = false;
        }
      }
    };

    const logout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('user_id');
      localStorage.removeItem('username');
      isLoggedIn.value = false;
      isAdmin.value = false;
      closeMobileMenu();
      window.location.href = '/login';
    };

    const toggleMobileMenu = () => {
      isMobileMenuOpen.value = !isMobileMenuOpen.value;
    };

    const closeMobileMenu = () => {
      isMobileMenuOpen.value = false;
      isAdminMobileMenuOpen.value = false;
      isUserMobileMenuOpen.value = false;
    };

    const toggleAdminMobileMenu = () => {
      isAdminMobileMenuOpen.value = !isAdminMobileMenuOpen.value;
      isUserMobileMenuOpen.value = false;
    };

    const toggleUserMobileMenu = () => {
      isUserMobileMenuOpen.value = !isUserMobileMenuOpen.value;
      isAdminMobileMenuOpen.value = false;
    };

    const handleResize = () => {
      if (window.innerWidth > 768) {
        closeMobileMenu();
      }
    };

    const handleRouteChange = () => {
      checkAuth();
    };

    onMounted(() => {
      checkAuth();
      window.addEventListener('resize', handleResize);
      window.addEventListener('storage', checkAuth);
      if (router) {
        router.afterEach(checkAuth);
      }
    });

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('storage', checkAuth);
    });

    return {
      isLoggedIn,
      isAdmin,
      isMobileMenuOpen,
      isAdminMobileMenuOpen,
      isUserMobileMenuOpen,
      logout,
      toggleMobileMenu,
      closeMobileMenu,
      toggleAdminMobileMenu,
      toggleUserMobileMenu
    };
  }
};
</script>

<style scoped>
.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
}

.navbar-logo a {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: white;
}

.logo-icon {
  font-size: 24px;
  margin-right: 8px;
}

.logo-text {
  font-size: 18px;
  font-weight: bold;
}

.navbar-nav {
  display: flex;
  align-items: center;
}

.nav-links {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-item {
  position: relative;
  margin-left: 8px;
  display: flex;
  align-items: center;
}

.nav-link {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  padding: 10px 15px;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-size: 14px;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  line-height: 1;
}

.nav-link:hover {
  color: white;
  background: rgba(255, 255, 255, 0.2);
}

.nav-link.active {
  color: white;
  background: rgba(255, 255, 255, 0.25);
}

.dropdown-arrow {
  font-size: 10px;
  margin-left: 4px;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  list-style: none;
  margin: 5px 0 0 0;
  padding: 8px 0;
  min-width: 160px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease;
}

.dropdown:hover .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  padding: 10px 20px;
  color: #333;
  text-decoration: none;
  display: block;
  transition: background 0.2s ease;
}

.dropdown-item:hover {
  background: #f5f5f5;
}

.logout-btn {
  color: #ff6b6b;
}

.logout-btn:hover {
  background: rgba(255, 107, 107, 0.2);
  color: #ff6b6b;
}

/* 移动端按钮 */
.navbar-toggle {
  display: none;
  flex-direction: column;
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
}

.toggle-bar {
  width: 25px;
  height: 3px;
  background: white;
  margin: 3px 0;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.navbar-toggle.active .toggle-bar:nth-child(1) {
  transform: rotate(-45deg) translate(-5px, 6px);
}

.navbar-toggle.active .toggle-bar:nth-child(2) {
  opacity: 0;
}

.navbar-toggle.active .toggle-bar:nth-child(3) {
  transform: rotate(45deg) translate(-5px, -6px);
}

/* 移动端菜单 */
.mobile-menu {
  display: none;
  background: white;
  border-top: 1px solid #eee;
}

.mobile-menu.active {
  display: block;
}

.mobile-links {
  list-style: none;
  margin: 0;
  padding: 0;
}

.mobile-link {
  display: block;
  padding: 15px 20px;
  color: #333;
  text-decoration: none;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s ease;
}

.mobile-link:hover {
  background: #f8f9fa;
}

.mobile-link.logout-btn {
  color: #ff6b6b;
}

.mobile-dropdown-toggle {
  width: 100%;
  padding: 15px 20px;
  text-align: left;
  background: none;
  border: none;
  border-bottom: 1px solid #f0f0f0;
  color: #333;
  cursor: pointer;
  font-size: 14px;
}

.mobile-dropdown-menu {
  display: none;
  background: #f8f9fa;
}

.mobile-dropdown-menu.active {
  display: block;
}

.mobile-dropdown-item {
  display: block;
  padding: 12px 20px 12px 40px;
  color: #333;
  text-decoration: none;
  border-bottom: 1px solid #eee;
  transition: background 0.2s ease;
}

.mobile-dropdown-item:hover {
  background: #e9ecef;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .navbar-nav {
    display: none;
  }
  
  .navbar-toggle {
    display: flex;
  }
  
  .navbar-container {
    padding: 0 15px;
  }
}
</style>