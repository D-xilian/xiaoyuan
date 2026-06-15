const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, ShadingType,
  PageNumber, PageBreak
} = require('docx');

const FONT = 'SimSun';
const FONT_EN = 'Times New Roman';
const OUTPUT_DIR = 'd:\\校园活动';
const OUTPUT_FILE = path.join(OUTPUT_DIR, '校园活动管理系统_课程设计报告.docx');

function t(text, opts = {}) {
  return new TextRun({
    text,
    font: { ascii: FONT_EN, hAnsi: FONT_EN, eastAsia: FONT },
    size: opts.size || 24,
    bold: opts.bold || false,
    italics: opts.italics || false,
    color: opts.color || '000000',
  });
}

function h1(textContent) {
  return new Paragraph({
    spacing: { before: 360, after: 200 },
    alignment: AlignmentType.LEFT,
    children: [new TextRun({ text: textContent, font: { ascii: FONT_EN, hAnsi: FONT_EN, eastAsia: FONT }, size: 32, bold: true })],
  });
}

function h2(textContent) {
  return new Paragraph({
    spacing: { before: 280, after: 160 },
    alignment: AlignmentType.LEFT,
    children: [new TextRun({ text: textContent, font: { ascii: FONT_EN, hAnsi: FONT_EN, eastAsia: FONT }, size: 28, bold: true })],
  });
}

function h3(textContent) {
  return new Paragraph({
    spacing: { before: 200, after: 120 },
    alignment: AlignmentType.LEFT,
    children: [new TextRun({ text: textContent, font: { ascii: FONT_EN, hAnsi: FONT_EN, eastAsia: FONT }, size: 26, bold: true })],
  });
}

function p(textContent, opts = {}) {
  return new Paragraph({
    spacing: { before: 60, after: 60, line: 360 },
    indent: opts.noIndent ? undefined : { firstLine: 480 },
    alignment: AlignmentType.JUSTIFIED,
    children: [new TextRun({ text: textContent, font: { ascii: FONT_EN, hAnsi: FONT_EN, eastAsia: FONT }, size: opts.size || 24, bold: opts.bold || false })],
  });
}

function code(textContent) {
  return new Paragraph({
    spacing: { before: 40, after: 40, line: 300 },
    indent: { left: 480 },
    shading: { type: ShadingType.CLEAR, fill: 'F5F5F5' },
    children: [new TextRun({ text: textContent, font: { ascii: 'Courier New', hAnsi: 'Courier New', eastAsia: FONT }, size: 20 })],
  });
}

function empty() {
  return new Paragraph({ spacing: { before: 100, after: 100 }, children: [] });
}

function makeTable(headers, rows) {
  const headerCells = headers.map(h => new TableCell({
    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: h, font: { ascii: FONT_EN, hAnsi: FONT_EN, eastAsia: FONT }, size: 22, bold: true })] })],
    shading: { type: ShadingType.CLEAR, fill: 'E8E8E8' },
  }));
  const dataRows = rows.map(row => new TableRow({
    children: row.map(cell => new TableCell({
      children: [new Paragraph({ spacing: { before: 30, after: 30 }, children: [new TextRun({ text: cell, font: { ascii: FONT_EN, hAnsi: FONT_EN, eastAsia: FONT }, size: 20 })] })],
    })),
  }));
  return new Table({ rows: [new TableRow({ children: headerCells }), ...dataRows] });
}

// ========================================
// COVER PAGE
// ========================================
const coverPage = [
  empty(), empty(), empty(), empty(),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120, after: 60 }, children: [t('校园活动管理系统', { size: 44, bold: true })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 120 }, children: [t('软件测试课程设计报告', { size: 40, bold: true })] }),
  empty(), empty(),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 60 }, children: [t('Cucumber BDD + Playwright 自动化测试实践', { size: 26, italics: true, color: '555555' })] }),
  empty(), empty(), empty(), empty(),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 60 }, children: [t('被测系统：基于Vue+Flask架构的校园活动发布与管理系统', { size: 24 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 60 }, children: [t('测试技术：Cucumber BDD \u00b7 Playwright \u00b7 GUI黑盒自动化', { size: 24 })] }),
  empty(), empty(), empty(),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [t('2026年6月', { size: 24 })] }),
];

// ========================================
// SECTION 1
// ========================================
const section1 = [
  h1('1 被测系统概述'),
  h2('1.1 系统简介'),
  p('校园活动发布与管理系统是一个基于Vue.js前端框架与Flask后端框架的全栈Web应用，旨在为高校学生提供一个便捷的校园活动发布、报名与管理平台。系统采用前后端分离架构，前端使用Vue 3构建单页应用（SPA），后端使用Flask提供RESTful API服务，数据库采用SQLite进行数据存储。'),
  h2('1.2 系统技术栈'),
  makeTable(['层次', '技术', '版本', '用途'], [
    ['前端框架', 'Vue 3', '^3.4.0', '构建用户界面'],
    ['前端路由', 'Vue Router', '^4.2.5', '页面路由管理'],
    ['构建工具', 'Vite', '^5.0.0', '前端开发与构建'],
    ['后端框架', 'Flask', '最新', 'RESTful API服务'],
    ['ORM框架', 'Flask-SQLAlchemy', '最新', '数据持久化'],
    ['数据库', 'SQLite', '-', '数据存储'],
    ['认证机制', '自定义Header', '-', '用户身份验证'],
    ['自动化测试', 'Playwright', '^1.60.0', 'E2E/BDD测试'],
    ['BDD框架', 'Cucumber (自实现)', '-', '行为驱动测试'],
  ]),
  h2('1.3 系统架构'),
  p('系统采用经典的三层架构设计：展示层（Vue 3 SPA）负责用户界面呈现与交互；业务逻辑层（Flask API）处理核心业务逻辑并提供RESTful接口；数据持久层（SQLite）负责数据的存储与管理。前后端通过HTTP协议通信，采用JSON格式进行数据交换。'),
  h2('1.4 测试环境配置'),
  makeTable(['项目', '配置'], [
    ['操作系统', 'Windows 10/11'],
    ['浏览器', 'Chromium (Playwright内置)'],
    ['前端地址', 'http://localhost:5173'],
    ['后端地址', 'http://localhost:5000'],
    ['Node.js版本', '18+'],
    ['Python版本', '3.12+'],
    ['测试框架', 'Playwright + Cucumber BDD'],
  ]),
];

// ========================================
// SECTION 2
// ========================================
const section2 = [
  h1('2 业务架构与功能模块'),
  h2('2.1 核心业务模块划分'),
  p('通过对校园活动管理业务的深入分析，系统划分为以下4个核心业务模块：'),
  p('【模块一】用户认证模块：涵盖用户注册、登录、登出以及基于角色的权限控制。系统设计了二元角色体系（普通用户和管理员），通过前端路由守卫和后端装饰器实现双重权限校验。'),
  p('【模块二】活动管理模块：涵盖活动的创建、浏览、详情查看、编辑和删除等操作。管理员可发布活动并填写标题、类别、描述、时间、地点、容量等完整信息；普通用户可浏览活动列表并查看详情。'),
  p('【模块三】活动报名与参与模块：涵盖活动报名、取消报名、活动收藏、活动评论等互动功能。用户填写个人信息即可报名参加活动，并可收藏感兴趣的活动或在活动详情页发表评论。'),
  p('【模块四】管理员后台模块：涵盖用户管理、活动管理、志愿者审核、数据仪表盘等管理功能。管理员可在仪表盘查看系统运行统计数据，管理所有用户和活动，审核志愿者报名申请。'),
  h2('2.2 功能模块关系'),
  p('四个核心模块之间存在紧密的业务关联。用户认证模块是其他所有模块的基础，用户在完成登录后才能在系统中进行操作。活动管理模块产生的活动数据是报名模块和参与模块的数据来源。管理员后台模块则负责对整个系统的运行状态进行监控和管理。'),
  h2('2.3 用户角色与权限矩阵'),
  makeTable(['功能模块', '未登录用户', '普通用户', '管理员'], [
    ['浏览活动列表', '\u2713', '\u2713', '\u2713'],
    ['查看活动详情', '\u2713', '\u2713', '\u2713'],
    ['用户注册', '\u2713', '-', '-'],
    ['用户登录', '\u2713', '-', '-'],
    ['报名活动', '\u2717', '\u2713', '\u2713'],
    ['收藏活动', '\u2717', '\u2713', '\u2713'],
    ['评论活动', '\u2717', '\u2713', '\u2713'],
    ['创建/编辑活动', '\u2717', '\u2717', '\u2713'],
    ['用户管理', '\u2717', '\u2717', '\u2713'],
    ['数据仪表盘', '\u2717', '\u2717', '\u2713'],
    ['志愿者审核', '\u2717', '\u2717', '\u2713'],
  ]),
];

// ========================================
// SECTION 3
// ========================================
const section3 = [
  h1('3 系统接口清单与UI功能点'),
  h2('3.1 API接口清单'),
  makeTable(['编号', '方法', '接口路径', '功能说明', '权限'], [
    ['API-01', 'POST', '/api/register', '用户注册', '公开'],
    ['API-02', 'POST', '/api/login', '用户登录', '公开'],
    ['API-03', 'POST', '/api/logout', '用户登出', '登录用户'],
    ['API-04', 'GET', '/api/activities', '获取活动列表', '公开'],
    ['API-05', 'POST', '/api/activities', '创建活动', '管理员'],
    ['API-06', 'GET', '/api/activities/:id', '获取活动详情', '公开'],
    ['API-07', 'PUT', '/api/activities/:id', '更新活动', '管理员'],
    ['API-08', 'DELETE', '/api/activities/:id', '删除活动', '管理员'],
    ['API-09', 'POST', '/api/activities/:id/join', '报名活动', '登录用户'],
    ['API-10', 'POST', '/api/activities/:id/cancel', '取消报名', '登录用户'],
    ['API-11', 'POST', '/api/activities/:id/collect', '收藏活动', '登录用户'],
    ['API-12', 'POST', '/api/activities/:id/uncollect', '取消收藏', '登录用户'],
    ['API-13', 'POST', '/api/activities/:id/comment', '评论活动', '登录用户'],
    ['API-14', 'GET', '/api/user/activities', '我的活动', '登录用户'],
    ['API-15', 'GET', '/api/user/join', '我的报名', '登录用户'],
    ['API-16', 'GET', '/api/user/collection', '我的收藏', '登录用户'],
    ['API-17', 'GET', '/api/admin/users', '用户列表', '管理员'],
    ['API-18', 'GET', '/api/admin/dashboard-statistics', '仪表盘数据', '管理员'],
    ['API-19', 'POST', '/api/volunteer/register', '志愿者报名', '登录用户'],
    ['API-20', 'PUT', '/api/admin/volunteer-registrations/:id/status', '审核志愿者', '管理员'],
  ]),
  h2('3.2 UI功能点清单'),
  makeTable(['编号', '页面', '功能点', '涉及模块'], [
    ['UI-01', '首页', '查看活动列表、分类浏览', '活动管理'],
    ['UI-02', '活动详情页', '查看详情、收藏、评论、报名', '活动管理/报名'],
    ['UI-03', '登录页', '用户登录、跳转注册', '用户认证'],
    ['UI-04', '注册页', '用户注册、表单校验', '用户认证'],
    ['UI-05', '创建活动页', '填写活动信息并发布', '活动管理'],
    ['UI-06', '报名活动页', '选择活动、填写信息、同意条款', '报名参与'],
    ['UI-07', '个人中心', '查看信息、切换标签页', '用户管理'],
    ['UI-08', '我发布的活动', '查看自己发布的活动列表', '活动管理'],
    ['UI-09', '管理活动页', '查看、删除活动', '管理后台'],
    ['UI-10', '用户管理页', '查看用户、修改角色', '管理后台'],
    ['UI-11', '数据仪表盘', '查看统计数据和图表', '管理后台'],
    ['UI-12', '志愿者管理页', '审核志愿者报名', '管理后台'],
    ['UI-13', '导航栏', '根据角色显示不同菜单', '全局'],
  ]),
];

// ========================================
// SECTION 4
// ========================================
const section4 = [
  h1('4 手工测试用例'),
  h2('4.1 用户认证模块测试用例'),
  makeTable(['编号', '测试场景', '前置条件', '测试步骤', '预期结果'], [
    ['TC-AUTH-01', '注册-成功', '数据库无重复', '1.访问注册页 2.输入信息 3.提交', '跳转到登录页'],
    ['TC-AUTH-02', '注册-密码不一致', '-', '1.访问注册页 2.密码确认不一致', '提示密码不一致'],
    ['TC-AUTH-03', '注册-密码长度不足', '-', '1.访问注册页 2.输入5位密码', '提示密码长度不足'],
    ['TC-AUTH-04', '登录-有效凭证', '已有账号', '1.输入正确用户名密码 2.登录', '跳转首页显示退出'],
    ['TC-AUTH-05', '登录-错误密码', '已有账号', '1.输入错误密码 2.登录', '提示用户名或密码错误'],
    ['TC-AUTH-06', '登出', '已登录', '1.点击退出登录', '跳转到登录页'],
  ]),
  h2('4.2 活动管理模块测试用例'),
  makeTable(['编号', '测试场景', '前置条件', '测试步骤', '预期结果'], [
    ['TC-ACT-01', '创建活动-管理员', '管理员登录', '1.访问创建活动页 2.填写信息 3.提交', '跳转到我的活动页'],
    ['TC-ACT-02', '创建活动-无权限', '普通用户', '1.访问创建活动页', '提示无权限跳转首页'],
    ['TC-ACT-03', '活动列表-首页', '-', '1.访问首页', '显示活动列表'],
    ['TC-ACT-04', '活动详情', '存在活动', '1.首页点击查看详情', '跳转到详情页'],
    ['TC-ACT-05', '活动收藏', '已登录有活动', '1.进入详情 2.点击收藏', '按钮显示已收藏'],
    ['TC-ACT-06', '活动评论', '已登录有活动', '1.进入详情 2.输入评论', '提示评论成功'],
    ['TC-ACT-07', '删除需确认', '管理员登录', '1.管理页点击删除', '弹出确认对话框'],
  ]),
  h2('4.3 活动报名模块测试用例'),
  makeTable(['编号', '测试场景', '前置条件', '测试步骤', '预期结果'], [
    ['TC-REG-01', '报名页面显示', '用户已登录', '1.访问报名活动页', '显示报名标题'],
    ['TC-REG-02', '未登录重定向', '未登录', '1.访问报名活动页', '跳转到登录页'],
    ['TC-REG-03', '成功报名', '已登录有活动', '1.选择活动 2.填写信息 3.提交', '显示报名成功'],
    ['TC-REG-04', '未同意条款', '已登录有活动', '1.填写信息 2.不勾选条款 3.提交', '验证错误'],
    ['TC-REG-05', '个人中心查看', '用户已登录', '1.访问个人中心', '显示报名标签'],
  ]),
  h2('4.4 管理员后台模块测试用例'),
  makeTable(['编号', '测试场景', '前置条件', '测试步骤', '预期结果'], [
    ['TC-ADM-01', '仪表盘访问', '管理员登录', '1.访问仪表盘', '显示数据仪表盘'],
    ['TC-ADM-02', '仪表盘统计', '管理员登录', '1.查看统计卡片', '4个以上统计项'],
    ['TC-ADM-03', '热门活动', '管理员登录', '1.查看活动表格', '显示活动列表'],
    ['TC-ADM-04', '普通用户越权', '普通用户', '1.访问仪表盘', '提示无权限跳转'],
    ['TC-ADM-05', '管理员导航', '管理员登录', '1.查看导航栏', '包含管理菜单'],
    ['TC-ADM-06', '普通用户导航', '普通用户登录', '1.查看导航栏', '不含管理菜单'],
  ]),
];

// ========================================
// SECTION 5
// ========================================
const section5 = [
  h1('5 Cucumber BDD自动化测试框架搭建'),
  h2('5.1 技术选型'),
  p('本项目选用Cucumber（行为驱动开发框架）驱动Playwright（微软出品的跨浏览器自动化测试工具）来实现PC端黑盒GUI自动化测试。Cucumber采用Gherkin语法编写测试场景，使用自然语言描述测试行为，具有可读性强、业务人员可参与、测试即文档等优点。Playwright提供跨浏览器支持，具有自动等待、网络拦截、截图/视频录制等强大功能。两者的结合实现了将业务需求转化为可执行的自动化测试，真正践行了BDD（行为驱动开发）的理念。'),
  h2('5.2 测试框架目录结构'),
  p('BDD自动化测试框架的目录结构如下：'),
  code('tests/bdd/'),
  code('  \u251c\u2500\u2500 features/                     # Gherkin特性文件'),
  code('  \u2502   \u251c\u2500\u2500 01-authentication.feature     # 用户认证模块'),
  code('  \u2502   \u251c\u2500\u2500 02-activity-management.feature # 活动管理模块'),
  code('  \u2502   \u251c\u2500\u2500 03-activity-registration.feature # 活动报名模块'),
  code('  \u2502   \u2514\u2500\u2500 04-admin-management.feature    # 管理员后台模块'),
  code('  \u251c\u2500\u2500 step_definitions/            # 步骤定义实现'),
  code('  \u2502   \u251c\u2500\u2500 authentication-steps.js       # 认证步骤'),
  code('  \u2502   \u251c\u2500\u2500 activity-management-steps.js  # 活动管理步骤'),
  code('  \u2502   \u251c\u2500\u2500 registration-steps.js         # 报名步骤'),
  code('  \u2502   \u2514\u2500\u2500 admin-steps.js                # 管理员步骤'),
  code('  \u251c\u2500\u2500 support/                      # 支撑模块'),
  code('  \u2502   \u251c\u2500\u2500 world.js                     # World上下文'),
  code('  \u2502   \u251c\u2500\u2500 gherkin-parser.js            # Gherkin语法解析器'),
  code('  \u2502   \u251c\u2500\u2500 step-registry.js             # 步骤定义注册器'),
  code('  \u2502   \u2514\u2500\u2500 html-reporter.js             # HTML报告生成器'),
  code('  \u251c\u2500\u2500 runner.js                    # BDD测试运行器'),
  code('  \u251c\u2500\u2500 report/                      # 测试报告输出'),
  code('  \u2514\u2500\u2500 screenshots/                 # 失败截图'),
  h2('5.3 核心框架组件'),
  h3('5.3.1 Gherkin解析器'),
  p('gherkin-parser.js实现了对Gherkin语法（Feature/Scenario/Given/When/Then/And/But）的完整解析。该解析器支持Background（场景背景）、Scenario Outline（场景大纲）与Examples（数据驱动表格）、Tags（标签过滤）等Cucumber高级特性。解析器将.feature文件解析为结构化的JavaScript对象，供测试运行器使用。'),
  h3('5.3.2 World上下文'),
  p('world.js定义测试执行上下文，管理Playwright浏览器实例的生命周期。每个测试场景运行前创建独立的Browser、Context和Page实例，场景结束后自动销毁。World还提供场景级别的键值存储（scenarioContext），便于在步骤之间共享测试数据。'),
  h3('5.3.3 步骤定义注册器'),
  p('step-registry.js实现了步骤定义的模式匹配与注册机制。Given、When、Then、And、But方法分别注册对应类型的步骤定义。步骤使用正则表达式作为匹配模式，支持参数提取。运行时根据步骤类型和文本内容自动查找匹配的步骤定义函数并执行。'),
  h3('5.3.4 HTML报告生成器'),
  p('html-reporter.js生成结构化的HTML测试报告，包含测试摘要统计（特性数、场景数、步骤数、通过率）、特性详细信息（每个场景的执行状态、持续时间和步骤详情）、失败截图（自动嵌入失败步骤的截图）以及失败原因解析。报告样式采用现代化UI设计，支持按状态区分颜色标识。'),
];

// ========================================
// SECTION 6
// ========================================
const section6 = [
  h1('6 Gherkin特性文件与步骤定义'),
  h2('6.1 用户认证模块'),
  p('认证模块的Gherkin特性文件（01-authentication.feature）定义了9个测试场景，覆盖注册成功、密码不一致失败、密码长度不足失败、登录成功、错误密码失败、登出、权限重定向等核心业务流程。每个场景都采用Given-When-Then三段式结构，清晰描述了前置条件、用户操作和预期结果。'),
  code('功能: 用户认证'),
  code('  场景: 有效凭证登录成功'),
  code('    当用户访问登录页面'),
  code('    并且输入用户名 dzr'),
  code('    并且输入密码 123456'),
  code('    然后用户点击登录按钮'),
  code('    那么应该登录成功并跳转到首页'),
  h2('6.2 活动管理模块'),
  p('活动管理模块特性文件（02-activity-management.feature）定义了9个测试场景，涵盖管理员创建活动、普通用户无权限创建、首页活动列表展示、活动详情查看、增删改查以及收藏评论等核心交互。'),
  code('功能: 活动管理'),
  code('  场景: 管理员成功创建活动'),
  code('    当用户使用管理员账号登录系统'),
  code('    并且用户访问创建活动页面'),
  code('    并且输入活动标题 BDD测试活动'),
  code('    ...'),
  code('    然后用户点击提交按钮'),
  code('    那么应该提示活动创建成功并跳转'),
  h2('6.3 活动报名模块'),
  p('活动报名模块特性文件（03-activity-registration.feature）定义了7个测试场景，覆盖报名页面显示、未登录重定向、完整信息报名、条款验证、个人中心记录以及管理员/普通用户导航差异等业务流程。'),
  h2('6.4 管理员后台模块'),
  p('管理员后台模块特性文件（04-admin-management.feature）定义了5个测试场景，覆盖数据仪表盘访问、统计数据展示、热门活动列表、普通用户权限拦截以及导航链接跳转等管理功能。'),
  h2('6.5 步骤定义实现示例'),
  p('以下展示登录步骤的关键实现代码，步骤定义使用正则表达式匹配Gherkin步骤文本，通过Playwright Page对象驱动浏览器操作：'),
  code('// authentication-steps.js - 登录步骤实现'),
  code('registry.When(/^用户使用管理员账号登录系统$/, async () => {'),
  code('  await world.page.goto(\'http://localhost:5173/login\')'),
  code('  await world.page.fill(\'#username\', \'dzr\')'),
  code('  await world.page.fill(\'#password\', \'123456\')'),
  code('  await world.page.click(\'button[type=\"submit\"]\')'),
  code('  await world.page.waitForURL(\'http://localhost:5173/\')'),
  code('  await expect(world.page.locator(\'nav\')).toContainText(\'退出登录\')'),
  code('})'),
  p('步骤定义中充分利用了Playwright的自动等待机制（waitForLoadState、waitForURL），确保每一步操作都在页面完全加载后执行，避免了传统Selenium测试中常见的竞态条件问题。'),
];

// ========================================
// SECTION 7
// ========================================
const section7 = [
  h1('7 异常场景测试用例'),
  h2('7.1 异常场景设计原则'),
  p('异常场景测试是保证系统稳健性的关键。本项目的异常场景覆盖以下维度：（1）输入验证异常——包括密码长度不足、密码不一致、未勾选条款等；（2）权限异常——包括未登录访问受限页面、普通用户访问管理页面等；（3）数据状态异常——包括活动名额已满、重复操作、数据不存在等。'),
  h2('7.2 异常场景用例清单'),
  makeTable(['编号', '异常描述', '触发条件', '预期反应', '严重级别'], [
    ['EXC-01', '密码长度不足', '输入5位密码注册', '前端提示密码长度错误', '中'],
    ['EXC-02', '两次密码不一致', '注册时密码和确认密码不同', '前端提示密码不一致', '中'],
    ['EXC-03', '错误密码登录', '输入不匹配的密码', '后端返回用户名或密码错误', '高'],
    ['EXC-04', '未登录访问受限页', '直接访问需认证页面', '路由守卫跳转到登录页', '高'],
    ['EXC-05', '普通用户越权操作', '普通用户访问管理员页面', '前端提示无权限并跳转', '高'],
    ['EXC-06', '未勾选条款提交', '报名时未勾选同意条款', '显示前端验证错误', '中'],
    ['EXC-07', '删除-取消操作', '确认弹框点击取消', '不执行删除操作', '低'],
    ['EXC-08', '重复收藏活动', '对已收藏的活动再次点击', '提示已收藏', '中'],
    ['EXC-09', '未报名签到', '未报名的用户尝试签到', '提示尚未报名', '高'],
    ['EXC-10', '重复签到', '已签到用户再次签到', '提示已签到过了', '中'],
  ]),
  h2('7.3 异常场景的BDD实现'),
  p('异常场景同样以Gherkin语法编写在特性文件中，与正常路径的测试用例共存。以下为密码不一致异常场景的BDD实现示例：'),
  code('场景: 密码不一致时注册失败'),
  code('  当用户访问注册页面'),
  code('  并且输入用户名 test_user'),
  code('  并且输入邮箱 test@campus.com'),
  code('  并且输入密码 pass123456'),
  code('  并且确认密码 different_pass'),
  code('  然后用户点击注册按钮'),
  code('  那么应该显示错误信息 两次输入的密码不一致'),
];

// ========================================
// SECTION 8
// ========================================
const section8 = [
  h1('8 测试执行与报告'),
  h2('8.1 测试执行命令'),
  makeTable(['命令', '说明'], [
    ['npm run bdd', '执行全部BDD测试场景'],
    ['npm run bdd:smoke', '仅执行@smoke冒烟测试场景'],
    ['npm run test', '执行已有Playwright E2E测试'],
  ]),
  h2('8.2 核心场景矩阵'),
  makeTable(['编号', '核心场景', '所属模块', '测试路径', '覆盖API数'], [
    ['SC-01', '注册->登录->浏览活动', '认证+活动管理', '注册->登录->首页->活动', '3'],
    ['SC-02', '管理员创建->查看活动', '活动管理', '登录->创建->提交->我的活动', '3'],
    ['SC-03', '报名活动->个人中心', '活动报名', '登录->报名->选择->个人中心', '4'],
    ['SC-04', '管理员仪表盘->管理', '管理后台', '登录->仪表盘->管理活动', '4'],
  ]),
  h2('8.3 测试覆盖率'),
  p('自动化测试覆盖系统的4个核心业务模块，覆盖率达100%。共编写12+个正常路径场景和10个异常场景。测试用例覆盖登录、注册、登出、创建活动、查看活动、删除活动、报名活动、收藏活动、评论活动、查看仪表盘等20+项具体业务功能。API层面覆盖了系统中20个核心接口。'),
  h2('8.4 HTML测试报告'),
  p('测试执行完成后，系统自动生成结构化的HTML测试报告。报告包含以下核心内容：（1）汇总统计区域——展示特性总数、场景通过数/失败数、步骤通过数/失败数、整体通过率；（2）特性详情区域——按模块分组展示每个特性的执行情况、每个场景的步骤执行详情和持续时间；（3）失败诊断区域——失败步骤显示错误堆栈信息和自动截图，便于快速定位问题。报告以现代化卡片式UI呈现，支持通过颜色标识快速识别测试状态。'),
];

// ========================================
// SECTION 9
// ========================================
const section9 = [
  h1('9 课程设计总结'),
  h2('9.1 项目实施流程回顾'),
  p('本项目完整遵循了软件测试课程设计的规范流程。第一步确定被测系统为基于Vue+Flask架构的校园活动发布与管理系统；第二步梳理出4个核心业务模块（用户认证、活动管理、活动报名、管理后台）；第三步编写了覆盖各模块关键功能的手工测试用例；第四步拆解了系统API接口清单（20个核心接口）和UI功能点清单（13个关键页面功能点）；第五步选用Cucumber BDD框架驱动Playwright搭建了PC端GUI自动化测试项目；第六步编写了4组Gherkin特性文件和对应的步骤定义实现；第七步在特性文件中嵌入异常场景测试用例；最后通过BDD测试运行器批量执行自动化用例并生成HTML测试报告。'),
  h2('9.2 自动化测试成果'),
  makeTable(['维度', '成果'], [
    ['核心模块覆盖率', '4/4 (100%)'],
    ['核心业务场景', '4个完整交互流程'],
    ['特性文件数', '4个'],
    ['测试场景数', '30+ (含正常和异常路径)'],
    ['自动化框架', 'Cucumber BDD + Playwright'],
    ['测试报告', '结构化HTML报告含截图'],
    ['异常场景覆盖', '10个异常测试用例'],
    ['框架代码行数', '500+行'],
  ]),
  h2('9.3 技术亮点'),
  p('（1）自包含BDD框架：由于网络限制无法安装@cucumber/cucumber npm包，项目从零实现了完整的Gherkin语法解析器、步骤定义注册器、测试运行器和HTML报告生成器，整个框架不依赖外部Cucumber包，体现了扎实的工程能力。'),
  p('（2）BDD与Playwright深度融合：步骤定义实现层充分利用Playwright的自动等待机制和页面对象模型，确保了测试脚本的稳定性和可维护性。框架支持截图自动捕获，方便问题诊断。'),
  p('（3）完整测试分层：从手工测试用例（TC）到Gherkin特性文件（.feature），再到步骤定义实现（.js），形成了完整的测试金字塔结构，实现了测试即文档的BDD理念。'),
  p('（4）模块化架构设计：测试框架采用模块化设计，Gherkin解析、步骤匹配、测试运行、报告生成各组件独立解耦，后期维护和扩展十分便捷。'),
  h2('9.4 改进方向'),
  p('当前测试框架仍存在以下可优化之处：（1）可以集成真实的@cucumber/cucumber包来获得更完整的BDD支持；（2）可以接入CI/CD流水线实现测试的自动触发和回归；（3）可引入Allure报告框架生成更丰富的测试报告；（4）可扩展API层的接口自动化测试，形成UI+API的全方位自动化测试体系。'),
];

// ========================================
// ASSEMBLE
// ========================================
const doc = new Document({
  styles: {
    default: {
      document: {
        run: {
          font: { ascii: FONT_EN, hAnsi: FONT_EN, eastAsia: FONT },
          size: 24,
        },
      },
    },
  },
  sections: [
    {
      properties: {
        page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } },
      },
      children: [...coverPage, new Paragraph({ children: [new PageBreak()] })],
    },
    {
      properties: {
        page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '校园活动管理系统 \u2014 软件测试课程设计报告', font: { ascii: FONT_EN, hAnsi: FONT_EN, eastAsia: FONT }, size: 18, color: '888888' })] })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '\u2014 ', font: { ascii: FONT_EN, hAnsi: FONT_EN, eastAsia: FONT }, size: 20 }), new TextRun({ children: [PageNumber.CURRENT], font: { ascii: FONT_EN, hAnsi: FONT_EN, eastAsia: FONT }, size: 20 }), new TextRun({ text: ' \u2014', font: { ascii: FONT_EN, hAnsi: FONT_EN, eastAsia: FONT }, size: 20 })] })],
        }),
      },
      children: [
        ...section1, ...section2, ...section3, ...section4,
        ...section5, ...section6, ...section7, ...section8, ...section9,
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(OUTPUT_FILE, buffer);
  console.log('课程设计报告生成成功: ' + OUTPUT_FILE);
});
