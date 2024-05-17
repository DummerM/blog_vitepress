import path from 'node:path'
import fs from 'node:fs'
import matter from 'gray-matter';
// import { default_navList } from '../config'
// 文件根目录
const DIR_PATH = path.resolve()
// 白名单,过滤不是文章的文件和文件夹
const WHITE_LIST = ['index.md', '.vitepress', 'node_modules', '.idea', 'assets', '.DS_Store', 'public']


// 判断是否是文件夹
const isDirectory = (path) => fs.lstatSync(path).isDirectory()

// 取差值
const intersections = (arr1, arr2) => Array.from(new Set(arr1.filter((item) => !new Set(arr2).has(item))))

// 把方法导出直接使用
function getList(params, path1, pathname) {
    // console.log('===>', params, path1)
    // 存放结果
    const res = []
    // 开始遍历params
    for (let file in params) {
        // 拼接目录
        const dir = path.join(path1, params[file])
        // 判断是否是文件夹
        const isDir = isDirectory(dir)
        if (isDir) {
            // 如果是文件夹,读取之后作为下一次递归参数
            const files = fs.readdirSync(dir)
            res.push({
                text: params[file],
                collapsed: true,
                items: getList(files, dir, `${pathname}/${params[file]}`),
            })
        } else {
            // 获取名字
            const name = path.basename(params[file])


            // 排除非 md 文件
            const suffix = path.extname(params[file])
            if (suffix !== '.md') {
                continue
            }

            // 读取文件内容
            const fileContent = fs.readFileSync(path1 + '/' + name, 'utf8');

            // 使用 gray-matter 解析文件内容，自动分离 Front Matter 和主体内容
            const { data } = matter(fileContent);

            // `data` 对象包含了 Front Matter 的内容
            // console.log(data);

            res.push({
                text: data.title,
                link: `/${pathname}/${name}`
            })
        }
    }
    // console.log('res:', res)
    return res
}


export const set_sidebar = (pathname) => {
    // 获取pathname的路径
    const dirPath = path.join(DIR_PATH, `./docs/${pathname}`)
    // 读取pathname下的所有文件或者文件夹
    const files = fs.readdirSync(dirPath)
    // 过滤掉
    const items = intersections(files, WHITE_LIST)
    // getList 函数后面会讲到
    return getList(items, dirPath, pathname)
}

// export const set_nav = () => {
//     const navList = [
//         {
//             text: "首页",
//             link: "/",
//         },
//     ]
//     default_navList.forEach(n => {
//         const { path: navPath, name: navName } = n
//         // 获取pathname的路径
//         const dirPath = path.join(DIR_PATH, `./docs/${navPath}`)
//         // 读取pathname下的所有文件或者文件夹
//         const files = fs.readdirSync(dirPath)
//         // 过滤掉
//         const items = intersections(files, WHITE_LIST)
//         console.log('items:',items)
//         navList.push({
//             text: navName,
//             items: items.map((i)=>{
//                 const result = {
//                     text: i,

//                 }
//             })
//         })
//     })
// }