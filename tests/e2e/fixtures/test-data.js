export const USERS = {
  admin: {
    username: 'dzr',
    password: '123456',
    email: '1217114890@qq.com',
    role: 'admin',
  },
  user: {
    username: 'xzh',
    password: '234567',
    email: '2944476443@qq.com',
    role: 'user',
  },
  newUser: {
    username: 'newuser_' + Date.now(),
    password: 'newpass123',
    email: `newuser_${Date.now()}@campus.com`,
  },
}

export const ACTIVITY = {
  title: '自动化测试活动_' + Date.now(),
  category: 'academic',
  description: '这是一个由Playwright自动化测试创建的活动，用于验证活动创建功能的正确性。该活动包含足够详细的描述信息。',
  time: '2026-12-25T10:00',
  location: '教学楼A-301',
  capacity: '50',
}

export const REGISTRATION = {
  name: '张三',
  phone: '13800138000',
  introduction: '我是计算机学院大二学生，对算法和数据结构有浓厚兴趣，曾参与多项校园活动组织工作，有丰富的活动经验，希望能够通过这次活动结识更多志同道合的同学。',
}
