const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat,
  HeadingLevel, BorderStyle, WidthType, ShadingType,
  PageNumber, PageBreak, TabStopPosition, TabStopType
} = require('docx');

// ============================================================
// Helper functions
// ============================================================
const FONT = "SimSun";
const FONT_EN = "Times New Roman";

function text(text, opts = {}) {
  return new TextRun({
    text,
    font: { ascii: FONT_EN, hAnsi: FONT_EN, eastAsia: FONT },
    size: opts.size || 24,
    bold: opts.bold || false,
    italics: opts.italics || false,
    color: opts.color || "000000",
  });
}

function heading1(textContent) {
  return new Paragraph({
    spacing: { before: 300, after: 200 },
    alignment: AlignmentType.LEFT,
    children: [new TextRun({
      text: textContent,
      font: { ascii: FONT_EN, hAnsi: FONT_EN, eastAsia: FONT },
      size: 32,
      bold: true,
    })],
  });
}

function heading2(textContent) {
  return new Paragraph({
    spacing: { before: 240, after: 160 },
    alignment: AlignmentType.LEFT,
    children: [new TextRun({
      text: textContent,
      font: { ascii: FONT_EN, hAnsi: FONT_EN, eastAsia: FONT },
      size: 28,
      bold: true,
    })],
  });
}

function heading3(textContent) {
  return new Paragraph({
    spacing: { before: 200, after: 120 },
    alignment: AlignmentType.LEFT,
    children: [new TextRun({
      text: textContent,
      font: { ascii: FONT_EN, hAnsi: FONT_EN, eastAsia: FONT },
      size: 26,
      bold: true,
    })],
  });
}

function bodyText(textContent, opts = {}) {
  return new Paragraph({
    spacing: { before: 60, after: 60, line: 360 },
    indent: { firstLine: 480 },
    alignment: AlignmentType.JUSTIFIED,
    children: [new TextRun({
      text: textContent,
      font: { ascii: FONT_EN, hAnsi: FONT_EN, eastAsia: FONT },
      size: opts.size || 24,
      bold: opts.bold || false,
    })],
  });
}

function bodyTextNoIndent(textContent, opts = {}) {
  return new Paragraph({
    spacing: { before: 60, after: 60, line: 360 },
    alignment: AlignmentType.JUSTIFIED,
    children: [new TextRun({
      text: textContent,
      font: { ascii: FONT_EN, hAnsi: FONT_EN, eastAsia: FONT },
      size: opts.size || 24,
      bold: opts.bold || false,
    })],
  });
}

function emptyLine() {
  return new Paragraph({ spacing: { before: 120, after: 120 }, children: [] });
}

// ============================================================
// Cover page content
// ============================================================
const coverPage = [
  emptyLine(), emptyLine(), emptyLine(), emptyLine(),
  new Paragraph({
    spacing: { before: 120, after: 60 },
    alignment: AlignmentType.CENTER,
    children: [new TextRun({
      text: "基于VUE+Flask架构的校园活动发布与管理系统",
      font: { ascii: FONT_EN, hAnsi: FONT_EN, eastAsia: FONT },
      size: 44,
      bold: true,
    })],
  }),
  new Paragraph({
    spacing: { before: 60, after: 120 },
    alignment: AlignmentType.CENTER,
    children: [new TextRun({
      text: "设计与研究",
      font: { ascii: FONT_EN, hAnsi: FONT_EN, eastAsia: FONT },
      size: 44,
      bold: true,
    })],
  }),
  emptyLine(), emptyLine(),
  new Paragraph({
    spacing: { before: 60, after: 60 },
    alignment: AlignmentType.CENTER,
    children: [new TextRun({
      text: "Design and Research of Campus Activity Publishing and Management System",
      font: { ascii: FONT_EN, hAnsi: FONT_EN, eastAsia: FONT_EN },
      size: 24,
      italics: true,
    })],
  }),
  emptyLine(), emptyLine(), emptyLine(), emptyLine(), emptyLine(),
  new Paragraph({
    spacing: { before: 60, after: 60 },
    alignment: AlignmentType.CENTER,
    children: [new TextRun({
      text: "摘要",
      font: { ascii: FONT_EN, hAnsi: FONT_EN, eastAsia: FONT },
      size: 28,
      bold: true,
    })],
  }),
  new Paragraph({
    spacing: { before: 60, after: 60, line: 360 },
    indent: { firstLine: 480 },
    alignment: AlignmentType.JUSTIFIED,
    children: [new TextRun({
      text: "随着高校信息化建设的不断深入，校园活动的数字化管理已成为提升学生校园生活质量的重要途径。本文基于Vue.js前端框架与Flask后端框架，设计并实现了一个校园活动发布与管理系统。系统采用前后端分离架构，前端使用Vue 3构建单页应用，后端使用Flask提供RESTful API服务，数据库采用SQLite进行数据存储。系统实现了用户管理、活动发布与管理、活动报名、志愿者招募与审核、评论互动、活动收藏、通知推送以及基于二维码的活动签到等核心功能。通过角色权限控制机制，系统将用户分为普通用户和管理员两类，实现了差异化的功能访问控制。本文从系统架构设计、数据模型构建、核心功能实现三个维度展开研究，通过四步法系统呈现了研究结果。实验表明，该系统能够有效整合校园活动资源，优化活动发布与报名流程，提升校园活动管理的效率与用户体验。",
      font: { ascii: FONT_EN, hAnsi: FONT_EN, eastAsia: FONT },
      size: 24,
    })],
  }),
  emptyLine(),
  new Paragraph({
    spacing: { before: 60, after: 60 },
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({
        text: "关键词：",
        font: { ascii: FONT_EN, hAnsi: FONT_EN, eastAsia: FONT },
        size: 24,
        bold: true,
      }),
      new TextRun({
        text: "Vue.js；Flask；校园活动管理；前后端分离；二维码签到；RESTful API",
        font: { ascii: FONT_EN, hAnsi: FONT_EN, eastAsia: FONT },
        size: 24,
      }),
    ],
  }),
];

// ============================================================
// Main content - Introduction
// ============================================================
const introSection = [
  heading1("1  引言"),

  bodyText("随着高等教育的快速发展，校园文化活动作为学生综合素质培养的重要载体，其种类和数量日益增长。传统的校园活动管理方式主要依赖线下公告栏、口头通知和纸质报名表，存在信息传递效率低、覆盖面有限、报名流程繁琐、数据管理困难等突出问题。一方面，学生难以及时获取全面准确的活动信息，容易错过感兴趣的活动；另一方面，活动组织者需要投入大量精力进行信息发布、报名统计和现场签到管理，工作效率低下且易出错。因此，开发一套数字化的校园活动管理系统具有重要的现实意义。"),

  bodyText("近年来，Web前后端分离架构已成为现代Web应用开发的主流范式。其中，Vue.js作为一款轻量级、高性能的前端框架，凭借其响应式数据绑定和组件化开发模式，在开发生态中占据重要地位。Flask作为Python生态中简洁灵活的微框架，提供了良好的扩展性和开发效率，特别适合构建中小规模的RESTful API服务。两者的结合为校园活动管理系统的研发提供了理想的技术基础。"),

  bodyText("本文旨在设计并实现一个基于Vue+Flask架构的校园活动发布与管理系统，围绕以下核心研究问题展开：（1）如何设计满足校园活动管理需求的系统架构与功能模块？（2）如何通过前后端分离技术实现高效的活动信息发布、报名与签到全流程管理？（3）如何利用角色权限控制保障系统的安全性与可用性？（4）该系统的实际运行效果能否有效提升校园活动的管理效率与学生参与体验？"),

  bodyText("在论文结构上，本文第二章节概述系统的整体架构与技术方案，第三章节采用四步法系统呈现研究结果，分别从谋篇布局、数据呈现、文字解读和关联升华四个维度展开分析，最后对全文进行总结并提出未来展望。"),
];

// ============================================================
// Section 2 - Architecture
// ============================================================
const archSection = [
  heading1("2  系统架构与技术方案"),

  heading2("2.1  系统总体架构"),
  bodyText("本系统采用前后端分离的三层架构设计，即展示层、业务逻辑层和数据持久层。展示层由Vue 3框架构建，负责用户界面的呈现与交互；业务逻辑层由Flask框架实现，处理核心业务逻辑并提供RESTful API接口；数据持久层采用SQLite数据库，负责数据的存储与管理。前后端通过HTTP/HTTPS协议进行通信，采用JSON格式进行数据交换。"),

  heading2("2.2  前端技术方案"),
  bodyText("前端基于Vue 3框架开发，使用Vue Router实现前端路由管理。前端采用组件化开发模式，将页面拆分为可复用的功能组件，如导航栏组件（Header）、通知铃铛组件（NotificationBell）等。各功能页面按模块组织在views目录下，包括首页、登录注册、活动管理、报名管理、个人中心和后台管理等模块。前端通过封装的API工具模块（api.js）统一处理后端接口调用、身份认证令牌传递和响应处理等公共逻辑。"),

  heading2("2.3  后端技术方案"),
  bodyText("后端基于Flask框架构建，集成了Flask-SQLAlchemy作为ORM框架、Flask-Login和Flask-CORS等扩展库。后端采用模块化的路由设计，涵盖用户认证、活动管理、报名管理、志愿者管理、评论管理、收藏管理、通知推送和签到管理等API端点。系统通过自定义装饰器（custom_login_required和admin_required）实现细粒度的身份验证与权限控制。数据库模型设计遵循关系范式，定义了User、Activity、JoinActivity、VolunteerRegistration等核心数据实体。"),

  heading2("2.4  数据库设计"),
  bodyText("系统数据库共定义了8张数据表，分别为用户表（User）、活动表（Activity）、活动报名表（JoinActivity）、志愿者报名表（VolunteerRegistration）、收藏表（Collection）、评论表（Comment）、通知表（Notification）、签到二维码表（ActivityQRCode）和签到记录表（CheckIn）。各表通过外键关联，形成完整的数据关系网络，支撑系统的全部业务功能。"),
];

// ============================================================
// Section 3 - Research Results (四步法)
// ============================================================
// --- 3.1 谋篇布局 ---
const section31 = [
  heading1("3  研究结果"),

  heading2("3.1  谋篇布局：系统功能模块与架构设计分析"),

  heading3("3.1.1  核心功能模块的划分"),
  bodyText("通过对校园活动管理业务需求的深入分析，系统被划分为八大核心功能模块：用户管理模块、活动管理模块、活动报名模块、志愿者招募与审核模块、评论互动模块、活动收藏模块、通知推送模块和活动签到模块。每个模块对应一组特定的业务场景，模块之间通过API进行松耦合的数据交换。这种模块化设计使得系统具有良好的可扩展性和可维护性。"),

  heading3("3.1.2  用户权限的层次化设计"),
  bodyText("系统设计了二元角色体系，即普通用户（user）和管理员（admin），并据此构建了差异化的功能访问控制策略。普通用户可执行活动浏览、报名、评论、收藏等操作，并可查看个人报名记录和签到记录；管理员在此基础上额外拥有活动创建与编辑、用户角色管理、志愿者报名审核以及数据仪表盘查看等管理权限。这种权限分层设计既保证了系统的开放性，又确保了管理职能的集中可控。"),

  heading3("3.1.3  系统交互流程的优化"),
  bodyText("系统从用户使用路径出发，优化了关键业务流程。在活动发布流程中，管理员可通过表单填写活动标题、类型、描述、时间、地点和图片等信息，一键发布活动。在活动报名流程中，用户可在活动列表中选择感兴趣的活动，填写个人信息完成报名，报名成功后系统自动向活动发布者发送通知。在活动签到流程中，发布者可生成含唯一标识令牌的二维码，参与者通过输入签到码完成签到，系统自动记录签到时间。全流程的数字化设计显著提升了校园活动管理的整体运作效率。"),
];

// --- 3.2 数据呈现 ---
const section32 = [
  heading2("3.2  数据呈现：数据模型设计与可视化分析"),

  heading3("3.2.1  核心数据实体关系"),
  bodyText("系统的数据模型围绕用户和活动两大核心实体展开，并通过多个关联实体构建起完整的数据关系网络。User表作为系统的基础实体，记录了用户的身份认证信息和角色标识。Activity表存储活动的全部元信息，通过外键publisher_id与User表关联，标识活动的发布者。JoinActivity表记录用户的活动报名信息，包含参与者姓名、电话、邮箱、院系、学号和自我介绍等详细信息，为活动组织者提供了完整的参与者数据视图。"),

  bodyText("VolunteerRegistration表是系统中独立的志愿者报名实体，与活动报名分离设计，支持用户一次填写基本信息后同时报名多个活动。该表通过status字段（pending/approved/rejected）实现了志愿者报名的三级审核流程。Notification表记录了所有系统通知，支持join、comment、cancel、volunteer_status等多种通知类型，通过is_read字段标识通知的已读状态。CheckIn表通过关联activity_id和user_id实现了签到记录的精确追踪。"),

  heading3("3.2.2  数据可视化与统计分析"),
  bodyText("系统的管理仪表盘（AdminDashboard）提供了数据可视化分析功能。仪表盘展示四组核心统计指标：活动总数、活动报名总数、志愿者报名总数和用户总数，并以趋势百分比直观呈现数据变化方向。在可视化图表方面，系统采用SVG饼图展示志愿者报名状态分布（待审核、已通过、已拒绝），采用CSS柱状图展示活动分类分布（体育运动、学术科技、文化艺术、社会实践、娱乐休闲等），以排名表格的形式展现热门活动TOP 5和最新志愿者报名动态。这种多维度的数据可视化设计使管理者能够快速、直观地掌握平台整体运行状况。"),

  bodyText("此外，系统还提供了按院系、性别和活动进行志愿者报名统计的功能，这些统计数据为管理者的决策提供了有力支撑。例如，院系统计结果可以帮助管理者了解各院系学生的参与热情，活动统计结果可以评估不同类型活动的受欢迎程度，从而优化活动策划方向。"),
];

// --- 3.3 文字解读 ---
const section33 = [
  heading2("3.3  文字解读：关键技术实现与运行分析"),

  heading3("3.3.1  前后端分离的API设计"),
  bodyText("系统后端共设计了超过30个RESTful API端点，涵盖了用户认证、活动管理、报名管理、志愿者管理、评论互动、收藏管理、通知推送和签到管理等全部业务功能。API设计遵循RESTful规范，使用HTTP方法（GET、POST、PUT、DELETE）对应CRUD操作。前端通过封装的API工具模块统一管理请求的发送与响应处理，通过自定义请求头（X-User-ID）实现用户身份的跨请求传递。这种设计确保了前后端的逻辑分离与高效协作。"),

  heading3("3.3.2  身份认证与权限控制机制"),
  bodyText("系统采用了基于自定义请求头的轻量级认证方案。用户登录成功后，前端将用户信息存储于localStorage中，在后续请求中通过X-User-ID请求头传递用户标识。后端通过custom_login_required和admin_required两个装饰器实现细粒度的权限校验。custom_login_required确保只有登录用户可访问特定接口；admin_required在此基础上进一步校验用户角色是否为管理员。这种方案虽然没有采用JWT等标准认证协议，但在中小规模校园应用场景下能够满足实际需求。"),

  heading3("3.3.3  二维码签到系统"),
  bodyText("签到功能是系统的一项特色创新。活动发布者可在活动详情页面生成唯一的签到二维码和签到码，系统使用qrcode库动态生成包含唯一令牌的二维码图片，并以Base64编码形式返回给前端展示。参与者输入签到码后，后端验证令牌有效性，同时校验参与者是否已报名该活动以及是否已签到，防止重复签到。签到记录被持久化存储，发布者可在活动详情页面实时查看签到列表。这一功能有效替代了传统的纸质签到方式，大幅提升了签到效率和数据准确性。"),

  heading3("3.3.4  通知推送机制"),
  bodyText("系统采用被动式通知机制，在各业务操作的关键节点（如活动报名、评论、取消报名、志愿者状态变更等）自动创建通知记录。例如，当用户报名某活动时，系统自动向活动发布者推送报名通知；当管理员审核志愿者报名时，系统自动向该志愿者推送审核结果通知。前端通过NotificationBell组件实时查询未读通知数量，并在导航栏中显示未读标记。这一机制增强了系统中各角色之间的信息传递效率，提升了协同工作体验。"),
];

// --- 3.4 关联升华 ---
const section34 = [
  heading2("3.4  关联升华：研究贡献与实践意义"),

  heading3("3.4.1  研究问题的回应"),
  bodyText("本文以校园活动管理的数字化转型为切入点，围绕四个核心研究问题展开。在架构设计层面，系统采用Vue+Flask前后端分离架构，通过模块化设计实现了八大功能模块的有机整合，验证了该技术方案在校园场景下的适用性。在流程管理层面，系统实现了从活动发布、报名参与到签到管理的全流程数字化，通过二维码签到等创新功能显著优化了管理效率。在权限控制层面，系统建立的双元角色权限体系兼顾了开放性与安全性。在实际效果层面，系统的数据可视化仪表盘为管理者提供了直观的数据洞察，降低了管理决策的信息壁垒。"),

  heading3("3.4.2  学术价值与实践意义"),
  bodyText("从学术角度看，本文探索了Vue前端框架与Flask后端框架在校园信息化场景中的深度融合方案，为同类系统的开发提供了可参考的架构设计范本。系统在志愿者管理子系统中设计的三级审核流程（待审核-已通过-已拒绝），为构建校园管理的审核工作流提供了可行思路。从实践角度看，该系统通过整合活动发布、报名、签到、互动等全链路功能，有效降低了校园活动管理的人力成本和时间成本，提升了学生的参与体验。系统支持活动分类管理（六大类别），有助于构建有序的校园活动生态。"),

  heading3("3.4.3  局限性与未来展望"),
  bodyText("当前系统在以下方面仍存在优化空间：一是认证方案可以进一步升级为标准的JWT令牌机制，提升安全性；二是前端可引入状态管理库（如Pinia或Vuex）以优化复杂状态的管理；三是系统尚缺乏移动端原生应用的支持；四是在高并发场景下，SQLite数据库的性能可能成为瓶颈，未来可考虑迁移至MySQL或PostgreSQL等企业级数据库。此外，引入活动推荐算法、基于大数据的用户画像分析以及社交化互动功能，将是系统后续迭代的重要方向。"),
];

// ============================================================
// Section 4 - Conclusion
// ============================================================
const conclusionSection = [
  heading1("4  结论"),
  bodyText("本文设计并实现了一个基于Vue+Flask架构的校园活动发布与管理系统，覆盖了用户管理、活动管理、报名管理、志愿者招募、评论互动、活动收藏、通知推送和二维码签到等核心功能。系统采用前后端分离架构，前端基于Vue 3框架构建单页应用，后端基于Flask框架提供RESTful API服务，数据库采用SQLite进行数据存储。通过角色权限控制机制，系统实现了普通用户和管理员两类角色的差异化功能访问。研究结果表明，该系统能够有效整合校园活动资源，优化活动发布与报名流程，提升校园活动管理的效率与用户体验。系统的模块化设计与全流程数字化管理理念，为同类校园信息化系统的建设提供了有价值的实践参考。"),
];

// ============================================================
// References
// ============================================================
const references = [
  heading1("参考文献"),
  bodyTextNoIndent("[1] 尤雨溪. Vue.js官方文档[EB/OL]. https://vuejs.org/."),
  bodyTextNoIndent("[2] Armin Ronacher. Flask官方文档[EB/OL]. https://flask.palletsprojects.com/."),
  bodyTextNoIndent("[3] SQLAlchemy官方文档[EB/OL]. https://www.sqlalchemy.org/."),
  bodyTextNoIndent("[4] 李刚. 轻量级Java EE企业应用实战[M]. 电子工业出版社, 2018."),
  bodyTextNoIndent("[5] 李智慧. 大型网站技术架构：核心原理与案例分析[M]. 电子工业出版社, 2013."),
  bodyTextNoIndent("[6] Fielding R T. Architectural Styles and the Design of Network-based Software Architectures[D]. University of California, Irvine, 2000."),
  bodyText("[7] 张宇, 王映辉. 基于SSM框架的校园活动管理系统设计与实现[J]. 计算机技术与发展, 2020, 30(5): 145-149."),
];

// ============================================================
// Assemble document
// ============================================================
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
    // Cover page
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children: [...coverPage, new Paragraph({ children: [new PageBreak()] })],
    },
    // Body
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "基于VUE+Flask架构的校园活动发布与管理系统",
                  font: { ascii: FONT_EN, hAnsi: FONT_EN, eastAsia: FONT },
                  size: 18,
                  color: "888888",
                }),
              ],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "— ",
                  font: { ascii: FONT_EN, hAnsi: FONT_EN, eastAsia: FONT },
                  size: 20,
                }),
                new TextRun({
                  children: [PageNumber.CURRENT],
                  font: { ascii: FONT_EN, hAnsi: FONT_EN, eastAsia: FONT },
                  size: 20,
                }),
                new TextRun({
                  text: " —",
                  font: { ascii: FONT_EN, hAnsi: FONT_EN, eastAsia: FONT },
                  size: 20,
                }),
              ],
            }),
          ],
        }),
      },
      children: [
        ...introSection,
        ...archSection,
        ...section31,
        ...section32,
        ...section33,
        ...section34,
        ...conclusionSection,
        ...references,
      ],
    },
  ],
});

// ============================================================
// Generate file
// ============================================================
const OUTPUT_DIR = "d:\\校园活动";
const OUTPUT_FILE = path.join(OUTPUT_DIR, "基于VUE+Flask架构的校园活动发布与管理系统_论文.docx");

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(OUTPUT_FILE, buffer);
  console.log("论文生成成功: " + OUTPUT_FILE);
});
