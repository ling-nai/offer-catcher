/**
 * 技能词典（纯数据，无逻辑）
 *
 * 约定：
 * - name 为规范名：提取结果的展示与去重键；
 * - aliases 为别名与写法变体（匹配时自动追加 name 的小写形式），
 *   如 js -> JavaScript、py -> Python、vue3 -> Vue；
 * - caseSensitive 列出需要大小写敏感匹配的别名，用于 R / C / Go
 *   等短名，防止误伤英文文本中的同形词（具体边界规则见 skills.ts）。
 */

export type SkillCategory =
  | 'frontend'
  | 'backend'
  | 'data'
  | 'office'
  | 'language'
  | 'certificate'

export interface SkillEntry {
  /** 规范名 */
  name: string
  /** 别名与写法变体 */
  aliases: string[]
  /** 需要大小写敏感匹配的别名（默认全部大小写不敏感） */
  caseSensitive?: string[]
}

export interface SkillCategoryGroup {
  /** 类别中文名 */
  label: string
  skills: SkillEntry[]
}

export type SkillDictionary = Record<SkillCategory, SkillCategoryGroup>

/** 类别固定顺序：提取结果按此顺序稳定输出 */
export const SKILL_CATEGORY_ORDER: SkillCategory[] = [
  'frontend',
  'backend',
  'data',
  'office',
  'language',
  'certificate',
]

export const SKILL_DICT: SkillDictionary = {
  frontend: {
    label: '前端',
    skills: [
      { name: 'JavaScript', aliases: ['javascript', 'js', 'es6'] },
      { name: 'TypeScript', aliases: ['typescript', 'ts'] },
      { name: 'HTML', aliases: ['html', 'html5'] },
      { name: 'CSS', aliases: ['css', 'css3'] },
      { name: 'React', aliases: ['react', 'react.js', 'reactjs'] },
      {
        name: 'Vue',
        aliases: ['vue', 'vue.js', 'vuejs', 'vue3', 'vue2'],
      },
      { name: 'Angular', aliases: ['angular', 'angularjs'] },
      { name: 'Svelte', aliases: ['svelte'] },
      { name: 'Next.js', aliases: ['next.js', 'nextjs'] },
      { name: 'Nuxt.js', aliases: ['nuxt.js', 'nuxtjs'] },
      {
        name: 'Tailwind CSS',
        aliases: ['tailwind', 'tailwindcss', 'tailwind css'],
      },
      { name: 'Sass', aliases: ['sass', 'scss'] },
      { name: 'Less', aliases: ['less'] },
      { name: 'Webpack', aliases: ['webpack'] },
      { name: 'Vite', aliases: ['vite', 'vitejs'] },
      { name: 'jQuery', aliases: ['jquery', 'jq'] },
      { name: 'Redux', aliases: ['redux'] },
      { name: 'Three.js', aliases: ['three.js', 'threejs'] },
      {
        name: '小程序',
        aliases: ['小程序', '微信小程序', 'miniprogram', 'weapp'],
      },
    ],
  },
  backend: {
    label: '后端',
    skills: [
      { name: 'Java', aliases: ['java'] },
      { name: 'Spring', aliases: ['spring', 'spring框架'] },
      {
        name: 'Spring Boot',
        aliases: ['spring boot', 'springboot', 'spring-boot'],
      },
      { name: 'Node.js', aliases: ['node.js', 'nodejs', 'node'] },
      { name: 'Express', aliases: ['express', 'expressjs'] },
      { name: 'Python', aliases: ['python', 'py', 'python3'] },
      { name: 'Django', aliases: ['django'] },
      { name: 'Flask', aliases: ['flask'] },
      {
        name: 'Go',
        aliases: ['Go', 'golang', 'go语言'],
        caseSensitive: ['Go'],
      },
      { name: 'Rust', aliases: ['rust'] },
      { name: 'C', aliases: ['C', 'c语言'], caseSensitive: ['C'] },
      { name: 'C++', aliases: ['c++', 'cpp'] },
      { name: 'C#', aliases: ['c#', 'csharp', 'c sharp'] },
      { name: 'PHP', aliases: ['php'] },
      { name: 'Ruby', aliases: ['ruby'] },
      { name: '.NET', aliases: ['.net', 'dotnet', 'asp.net'] },
      { name: 'MySQL', aliases: ['mysql'] },
      { name: 'PostgreSQL', aliases: ['postgresql', 'postgres', 'pgsql'] },
      { name: 'MongoDB', aliases: ['mongodb', 'mongo'] },
      { name: 'Redis', aliases: ['redis'] },
      { name: 'SQL Server', aliases: ['sql server', 'sqlserver', 'mssql'] },
      { name: 'Oracle', aliases: ['oracle'] },
      { name: 'Nginx', aliases: ['nginx'] },
      { name: 'Docker', aliases: ['docker'] },
      { name: 'Kubernetes', aliases: ['kubernetes', 'k8s'] },
      { name: 'Linux', aliases: ['linux'] },
      { name: 'Git', aliases: ['git'] },
      { name: 'GitHub', aliases: ['github'] },
      { name: 'GitLab', aliases: ['gitlab'] },
      { name: 'RESTful API', aliases: ['restful api', 'restful', 'rest api'] },
      { name: 'GraphQL', aliases: ['graphql'] },
      { name: 'Kafka', aliases: ['kafka'] },
      { name: 'RabbitMQ', aliases: ['rabbitmq', 'rabbit mq'] },
    ],
  },
  data: {
    label: '数据',
    skills: [
      { name: 'SQL', aliases: ['sql'] },
      { name: 'R', aliases: ['R', 'r语言'], caseSensitive: ['R'] },
      { name: 'Pandas', aliases: ['pandas'] },
      { name: 'NumPy', aliases: ['numpy'] },
      { name: 'Matplotlib', aliases: ['matplotlib'] },
      {
        name: 'scikit-learn',
        aliases: ['scikit-learn', 'sklearn', 'scikit learn'],
      },
      { name: 'TensorFlow', aliases: ['tensorflow', 'tf'] },
      { name: 'PyTorch', aliases: ['pytorch', 'torch'] },
      { name: 'Keras', aliases: ['keras'] },
      { name: 'Spark', aliases: ['spark', 'apache spark'] },
      { name: 'Hadoop', aliases: ['hadoop'] },
      { name: 'Hive', aliases: ['hive'] },
      { name: 'Flink', aliases: ['flink'] },
      { name: 'Airflow', aliases: ['airflow'] },
      { name: 'Tableau', aliases: ['tableau'] },
      { name: 'Power BI', aliases: ['power bi', 'powerbi'] },
      { name: 'SPSS', aliases: ['spss'] },
      { name: 'SAS', aliases: ['sas'] },
      { name: 'ETL', aliases: ['etl'] },
      { name: '机器学习', aliases: ['机器学习', 'machine learning', 'ml'] },
      { name: '深度学习', aliases: ['深度学习', 'deep learning', 'dl'] },
    ],
  },
  office: {
    label: '办公',
    skills: [
      { name: 'Word', aliases: ['word', 'ms word', 'microsoft word'] },
      { name: 'Excel', aliases: ['excel', 'ms excel'] },
      { name: 'PowerPoint', aliases: ['powerpoint', 'ppt', 'power point'] },
      { name: 'WPS', aliases: ['wps'] },
      { name: 'Outlook', aliases: ['outlook'] },
      { name: 'Visio', aliases: ['visio'] },
      { name: 'Axure', aliases: ['axure'] },
      { name: 'XMind', aliases: ['xmind'] },
      { name: 'Figma', aliases: ['figma'] },
      { name: 'Sketch', aliases: ['sketch'] },
      { name: 'Photoshop', aliases: ['photoshop', 'ps'] },
    ],
  },
  language: {
    label: '语言',
    skills: [
      { name: '英语', aliases: ['英语', 'english'] },
      { name: '日语', aliases: ['日语', 'japanese', 'jlpt'] },
      { name: '普通话', aliases: ['普通话', 'mandarin'] },
      { name: '粤语', aliases: ['粤语', 'cantonese'] },
      { name: '德语', aliases: ['德语', 'german'] },
      { name: '法语', aliases: ['法语', 'french'] },
      { name: '韩语', aliases: ['韩语', 'korean'] },
      { name: '西班牙语', aliases: ['西班牙语', 'spanish'] },
      { name: '俄语', aliases: ['俄语', 'russian'] },
    ],
  },
  certificate: {
    label: '证书',
    skills: [
      { name: 'CET-4', aliases: ['cet-4', 'cet4', '大学英语四级'] },
      { name: 'CET-6', aliases: ['cet-6', 'cet6', '大学英语六级'] },
      { name: '雅思', aliases: ['雅思', 'ielts'] },
      { name: '托福', aliases: ['托福', 'toefl'] },
      { name: 'PMP', aliases: ['pmp'] },
      { name: 'CPA', aliases: ['cpa', '注册会计师'] },
      { name: 'AWS认证', aliases: ['aws认证', 'aws certified', 'aws'] },
      { name: '软考', aliases: ['软考'] },
      {
        name: '教师资格证',
        aliases: ['教师资格证', '教师证', '教师资格'],
      },
    ],
  },
}
