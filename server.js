"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var cors_1 = require("cors");
var body_parser_1 = require("body-parser");
var fs_1 = require("fs");
var path_1 = require("path");
var url_1 = require("url");
var dotenv_1 = require("dotenv");
var express_rate_limit_1 = require("express-rate-limit");
// Load environment variables
dotenv_1.default.config();
var __filename = (0, url_1.fileURLToPath)(import.meta.url);
var __dirname = path_1.default.dirname(__filename);
var app = (0, express_1.default)();
var PORT = 3001;
// JUDGE0 CONFIG
var JUDGE0_URLS = [
    process.env.JUDGE0_URL,
    'http://172.20.0.10:2358',
    'http://localhost:2358',
    'http://backup:2358'
];
// Supabase Config
var supabase_js_1 = require("@supabase/supabase-js");
var supabase = (0, supabase_js_1.createClient)(process.env.VITE_SUPABASE_URL || '', process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '');
// RATE LIMITER
var limiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60, // Limit each IP to 60 requests per `window` (here, per 1 minute)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { status: 'Error', output: 'Too many requests, please try again later.', results: [] }
});
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
// Apply rate limiter to all api routes
app.use('/api/', limiter);
// Helper to save to Supabase Bucket (Async)
function saveToBucket(teamName, problemId, language, code) {
    return __awaiter(this, void 0, void 0, function () {
        var safeTeamName, ext, timestamp, filename, _a, data, error, err_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    safeTeamName = teamName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                    ext = language === 'python' ? 'py' : language === 'javascript' ? 'js' : 'txt';
                    timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                    filename = "".concat(safeTeamName, "/").concat(problemId, "_").concat(timestamp, ".").concat(ext);
                    return [4 /*yield*/, supabase
                            .storage
                            .from('codelog')
                            .upload(filename, code, {
                            contentType: 'text/plain',
                            upsert: false
                        })];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error("Supabase Storage Error:", error);
                        return [2 /*return*/, "error_saving"];
                    }
                    // Return the public URL or just the path if bucket is private (user said public)
                    return [2 /*return*/, data.path];
                case 2:
                    err_1 = _b.sent();
                    console.error("Bucket Error:", err_1);
                    return [2 /*return*/, "error_saving"];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Problem Registry
var PROBLEMS = {
    'two-sum': {
        id: 'two-sum',
        title: 'Two Sum',
        testCases: [
            { input: "nums = [2,7,11,15], target = 9", expected: "[0,1]", hidden: false, params: { nums: [2, 7, 11, 15], target: 9 } },
            { input: "nums = [3,2,4], target = 6", expected: "[1,2]", hidden: false, params: { nums: [3, 2, 4], target: 6 } },
            { input: "nums = [3,3], target = 6", expected: "[0,1]", hidden: true, params: { nums: [3, 3], target: 6 } },
            // Random-like case: 50 elements, unsorted, target at variable positions
            {
                input: "nums = [10,4,20...], target = 24",
                expected: "[1,2]",
                hidden: true,
                params: {
                    nums: [10, 4, 20, 15, 8, 3, 12, 1, 9, 50, 40, 30, 25, 60, 70, 80, 90, 100, 5, 2, 99, 88, 77, 66, 55, 44, 33, 22, 11, 13, 14, 16, 17, 18, 19, 21, 23, 24, 26, 27, 28, 29, 31, 32, 34, 35, 36, 37, 38, 39], // 20+8=28 no. 20 is index 2. 8 is index 4. wait. 20+4=24. index 2 and 1. output [1,2] sorted.
                    target: 24
                }
            },
        ],
        functionName: 'twoSum'
    },
    'binary-search': {
        id: 'binary-search',
        title: 'Binary Search',
        testCases: [
            { input: "nums = [-1,0,3,5,9,12], target = 9", expected: "4", hidden: false, params: { nums: [-1, 0, 3, 5, 9, 12], target: 9 } },
            { input: "nums = [-1,0,3,5,9,12], target = 2", expected: "-1", hidden: false, params: { nums: [-1, 0, 3, 5, 9, 12], target: 2 } },
            { input: "nums = [5], target = 5", expected: "0", hidden: true, params: { nums: [5], target: 5 } },
            // Random-like case: Larger sorted array
            {
                input: "nums = [-100...100], target = 42",
                expected: "28", // Index of 42 in this sequence? Let's check logic: -50 to 49. target 42.
                hidden: true,
                params: {
                    nums: [-50, -45, -40, -35, -30, -25, -20, -15, -10, -5, 0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 42, 44, 46, 48, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100],
                    target: 42
                }
            }
        ],
        functionName: 'search'
    }
};
var JUDGE0_LANG_IDS = {
    'javascript': 63,
    'typescript': 74,
    'python': 71,
    'java': 62,
    'cpp': 54,
    'c': 50
};
function validateCode(code, language) {
    if (!code || code.trim().length < 1)
        return false;
    // Strict Sanitizer: Check for forbidden strings
    var forbidden = [
        'process.exit', 'exec(', 'spawn(', 'os.system', 'eval(', '__import__', 'system(',
        'child_process', 'fork(', 'Runtime.getRuntime', 'ProcessBuilder', 'fs.readFile', 'fs.writeFile', 'open('
    ];
    if (forbidden.some(function (f) { return code.includes(f); }))
        return false;
    return true;
}
// Template Cache
var TEMPLATES = {};
function loadTemplates() {
    return __awaiter(this, void 0, void 0, function () {
        var langs, _i, langs_1, lang, templatePath, _a, _b, e_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    langs = ['javascript', 'typescript', 'python', 'java', 'cpp', 'c'];
                    _i = 0, langs_1 = langs;
                    _c.label = 1;
                case 1:
                    if (!(_i < langs_1.length)) return [3 /*break*/, 6];
                    lang = langs_1[_i];
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, 4, , 5]);
                    templatePath = path_1.default.join(__dirname, 'templates', "".concat(lang, ".txt"));
                    _a = TEMPLATES;
                    _b = lang;
                    return [4 /*yield*/, fs_1.default.promises.readFile(templatePath, 'utf-8')];
                case 3:
                    _a[_b] = _c.sent();
                    return [3 /*break*/, 5];
                case 4:
                    e_1 = _c.sent();
                    console.error("Failed to load template for ".concat(lang, ":"), e_1);
                    return [3 /*break*/, 5];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6: return [2 /*return*/];
            }
        });
    });
}
loadTemplates();
function wrapCode(code, language, problem) {
    var template = TEMPLATES[language];
    if (!template) {
        console.error("Template not found for ".concat(language));
        return code;
    }
    var testCasesJSON = JSON.stringify(problem.testCases.map(function (tc) { return tc.params; }));
    var wrapped = template
        .replace('{{USER_CODE}}', code)
        .replace('{{FUNCTION_NAME}}', problem.functionName)
        .replace('{{TEST_CASES_JSON}}', testCasesJSON);
    // Special handling for Compiled Languages (C/C++/Java require static Test Runners)
    if (language === 'java') {
        var sanitizedCode = code.replace(/public\s+class\s+Solution/, 'class Solution');
        wrapped = wrapped.replace('{{USER_CODE}}', sanitizedCode);
        var runnerCode = "";
        if (problem.id === 'two-sum') {
            runnerCode = "\n        int[] r1 = sol.twoSum(new int[]{2,7,11,15}, 9);\n        Arrays.sort(r1);\n        System.out.println(\"__JUDGE__ Test Case 1: \" + Arrays.toString(r1).replaceAll(\" \", \"\"));\n\n        int[] r2 = sol.twoSum(new int[]{3,2,4}, 6);\n        Arrays.sort(r2);\n        System.out.println(\"__JUDGE__ Test Case 2: \" + Arrays.toString(r2).replaceAll(\" \", \"\"));\n\n        try {\n            int[] r3 = sol.twoSum(new int[]{}, -1);\n            if (r3 == null || r3.length == 0)\n                System.out.println(\"__JUDGE__ Test Case 3: -1\");\n            else {\n                Arrays.sort(r3);\n                System.out.println(\"__JUDGE__ Test Case 3: \" + Arrays.toString(r3).replaceAll(\" \", \"\"));\n            }\n        } catch (Exception e) {\n            System.out.println(\"__JUDGE__ Test Case 3: -1\");\n        }\n\n        int[] r4 = sol.twoSum(new int[]{3,3}, 6);\n        Arrays.sort(r4);\n        System.out.println(\"__JUDGE__ Test Case 4: \" + Arrays.toString(r4).replaceAll(\" \", \"\"));\n\n        int[] nums5 = {10,4,20,15,8,3,12,1,9,50,40,30,25,60,70,80,90,100,5,2,99,88,77,66,55,44,33,22,11,13,14,16,17,18,19,21,23,24,26,27,28,29,31,32,34,35,36,37,38,39};\n        int[] r5 = sol.twoSum(nums5, 24);\n        Arrays.sort(r5);\n        System.out.println(\"__JUDGE__ Test Case 5: \" + Arrays.toString(r5).replaceAll(\" \", \"\"));\n        ";
        }
        else {
            runnerCode = "\n        System.out.println(\"__JUDGE__ Test Case 1: \" + sol.search(new int[]{-1,0,3,5,9,12}, 9));\n        System.out.println(\"__JUDGE__ Test Case 2: \" + sol.search(new int[]{-1,0,3,5,9,12}, 2));\n        System.out.println(\"__JUDGE__ Test Case 3: \" + sol.search(new int[]{5}, 5));\n\n        int[] nums4 = {-50,-45,-40,-35,-30,-25,-20,-15,-10,-5,0,2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,42,44,46,48,50,55,60,65,70,75,80,85,90,95,100};\n        System.out.println(\"__JUDGE__ Test Case 4: \" + sol.search(nums4, 42));\n        ";
        }
        wrapped = wrapped.replace('{{TEST_RUNNER}}', runnerCode);
    }
    else if (language === 'cpp') {
        var runnerCode = "";
        if (problem.id === 'two-sum') {
            runnerCode = "\n        vector<int> r1 = sol.twoSum({2,7,11,15}, 9);\n        sort(r1.begin(), r1.end());\n        cout << \"__JUDGE__ Test Case 1: \"; printVector(r1); cout << endl;\n\n        vector<int> r2 = sol.twoSum({3,2,4}, 6);\n        sort(r2.begin(), r2.end());\n        cout << \"__JUDGE__ Test Case 2: \"; printVector(r2); cout << endl;\n\n        vector<int> r3 = sol.twoSum({}, -1);\n        if (r3.empty()) cout << \"__JUDGE__ Test Case 3: -1\" << endl;\n        else { sort(r3.begin(), r3.end()); cout << \"__JUDGE__ Test Case 3: \"; printVector(r3); cout << endl; }\n\n        vector<int> r4 = sol.twoSum({3,3}, 6);\n        sort(r4.begin(), r4.end());\n        cout << \"__JUDGE__ Test Case 4: \"; printVector(r4); cout << endl;\n\n        vector<int> nums5 = {10,4,20,15,8,3,12,1,9,50,40,30,25,60,70,80,90,100,5,2,99,88,77,66,55,44,33,22,11,13,14,16,17,18,19,21,23,24,26,27,28,29,31,32,34,35,36,37,38,39};\n        vector<int> r5 = sol.twoSum(nums5, 24);\n        sort(r5.begin(), r5.end());\n        cout << \"__JUDGE__ Test Case 5: \"; printVector(r5); cout << endl;\n        ";
        }
        else {
            runnerCode = "\n        cout << \"__JUDGE__ Test Case 1: \" << sol.search({-1,0,3,5,9,12}, 9) << endl;\n        cout << \"__JUDGE__ Test Case 2: \" << sol.search({-1,0,3,5,9,12}, 2) << endl;\n        cout << \"__JUDGE__ Test Case 3: \" << sol.search({5}, 5) << endl;\n\n        vector<int> nums4 = {-50,-45,-40,-35,-30,-25,-20,-15,-10,-5,0,2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,42,44,46,48,50,55,60,65,70,75,80,85,90,95,100};\n        cout << \"__JUDGE__ Test Case 4: \" << sol.search(nums4, 42) << endl;\n        ";
        }
        wrapped = wrapped.replace('{{TEST_RUNNER}}', runnerCode);
    }
    else if (language === 'c') {
        var runnerCode = "";
        if (problem.id === 'two-sum') {
            runnerCode = "\n        int returnSize;\n\n        int nums1[] = {2,7,11,15};\n        int* r1 = twoSum(nums1, 4, 9, &returnSize);\n        qsort(r1, returnSize, sizeof(int), cmp);\n        printf(\"__JUDGE__ Test Case 1: \"); printArray(r1, returnSize); printf(\"\\n\");\n\n        int nums2[] = {3,2,4};\n        int* r2 = twoSum(nums2, 3, 6, &returnSize);\n        qsort(r2, returnSize, sizeof(int), cmp);\n        printf(\"__JUDGE__ Test Case 2: \"); printArray(r2, returnSize); printf(\"\\n\");\n\n        int nums3[] = {};\n        int* r3 = twoSum(nums3, 0, -1, &returnSize);\n        if (returnSize == 0) printf(\"__JUDGE__ Test Case 3: -1\\n\");\n        else { qsort(r3, returnSize, sizeof(int), cmp); printf(\"__JUDGE__ Test Case 3: \"); printArray(r3, returnSize); printf(\"\\n\"); }\n\n        int nums4[] = {3,3};\n        int* r4 = twoSum(nums4, 2, 6, &returnSize);\n        qsort(r4, returnSize, sizeof(int), cmp);\n        printf(\"__JUDGE__ Test Case 4: \"); printArray(r4, returnSize); printf(\"\\n\");\n\n        int nums5[] = {10,4,20,15,8,3,12,1,9,50,40,30,25,60,70,80,90,100,5,2,99,88,77,66,55,44,33,22,11,13,14,16,17,18,19,21,23,24,26,27,28,29,31,32,34,35,36,37,38,39};\n        int* r5 = twoSum(nums5, 50, 24, &returnSize);\n        qsort(r5, returnSize, sizeof(int), cmp);\n        printf(\"__JUDGE__ Test Case 5: \"); printArray(r5, returnSize); printf(\"\\n\");\n        ";
        }
        else {
            runnerCode = "\n        int nums1[] = {-1,0,3,5,9,12};\n        printf(\"__JUDGE__ Test Case 1: %d\\n\", search(nums1, 6, 9));\n\n        int nums2[] = {-1,0,3,5,9,12};\n        printf(\"__JUDGE__ Test Case 2: %d\\n\", search(nums2, 6, 2));\n\n        int nums3[] = {5};\n        printf(\"__JUDGE__ Test Case 3: %d\\n\", search(nums3, 1, 5));\n\n        int nums4[] = {-50,-45,-40,-35,-30,-25,-20,-15,-10,-5,0,2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,42,44,46,48,50,55,60,65,70,75,80,85,90,95,100};\n        printf(\"__JUDGE__ Test Case 4: %d\\n\", search(nums4, 43, 42));\n        ";
        }
        wrapped = wrapped.replace('{{TEST_RUNNER}}', runnerCode);
    }
    return wrapped;
}
// Helper: Submit to Judge0 with Fallback
function submitWithFallback(payload) {
    return __awaiter(this, void 0, void 0, function () {
        var lastError, _loop_1, _i, JUDGE0_URLS_1, url, state_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    lastError = null;
                    _loop_1 = function (url) {
                        var controller_1, timeoutId, response, data, err_2;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 3, , 4]);
                                    console.log("[JUDGE0] Attempting submission to ".concat(url, "..."));
                                    controller_1 = new AbortController();
                                    timeoutId = setTimeout(function () { return controller_1.abort(); }, 5000);
                                    return [4 /*yield*/, fetch("".concat(url, "/submissions?base64_encoded=true&wait=false"), {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json'
                                            },
                                            body: JSON.stringify(payload),
                                            signal: controller_1.signal
                                        })];
                                case 1:
                                    response = _b.sent();
                                    clearTimeout(timeoutId);
                                    if (!response.ok) {
                                        // If 4xx, it's a client error (e.g., bad code), don't retry, just throw
                                        if (response.status >= 400 && response.status < 500) {
                                            throw new Error("Judge0 Client Error: ".concat(response.status, " ").concat(response.statusText));
                                        }
                                        throw new Error("Judge0 Server Error: ".concat(response.status, " ").concat(response.statusText));
                                    }
                                    return [4 /*yield*/, response.json()];
                                case 2:
                                    data = _b.sent();
                                    console.log("[JUDGE0] Submission accepted on ".concat(url, ". Token: ").concat(data.token));
                                    return [2 /*return*/, { value: { token: data.token, url: url } }];
                                case 3:
                                    err_2 = _b.sent();
                                    console.error("[JUDGE0] Failed to submit to ".concat(url, ": ").concat(err_2.message));
                                    lastError = err_2;
                                    if (err_2.message.includes("Client Error"))
                                        throw err_2; // Don't fallback on client error
                                    return [3 /*break*/, 4];
                                case 4: return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, JUDGE0_URLS_1 = JUDGE0_URLS;
                    _a.label = 1;
                case 1:
                    if (!(_i < JUDGE0_URLS_1.length)) return [3 /*break*/, 4];
                    url = JUDGE0_URLS_1[_i];
                    return [5 /*yield**/, _loop_1(url)];
                case 2:
                    state_1 = _a.sent();
                    if (typeof state_1 === "object")
                        return [2 /*return*/, state_1.value];
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: throw lastError || new Error("All Judge0 instances failed.");
            }
        });
    });
}
app.post('/api/execute', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, code, language, problemId, teamName, isSubmission, userId, problem, _b, insertData, dbError, jobId_1, e_2;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = req.body, code = _a.code, language = _a.language, problemId = _a.problemId, teamName = _a.teamName, isSubmission = _a.isSubmission, userId = _a.userId;
                console.log("[EXECUTE] Async Request received for ".concat(problemId, " in ").concat(language, " (User: ").concat(userId, ")"));
                problem = PROBLEMS[problemId] || PROBLEMS['two-sum'];
                if (!validateCode(code, language)) {
                    return [2 /*return*/, res.status(400).json({ status: 'Invalid', output: 'Code validation failed: Restricted content detected.', results: [] })];
                }
                _c.label = 1;
            case 1:
                _c.trys.push([1, 3, , 4]);
                return [4 /*yield*/, supabase
                        .from('executions')
                        .insert({
                        user_id: userId || 'anonymous',
                        language: language,
                        code: code,
                        status: 'queued',
                        stdout: '',
                        stderr: '',
                        score: 0
                    })
                        .select()
                        .single()];
            case 2:
                _b = _c.sent(), insertData = _b.data, dbError = _b.error;
                if (dbError) {
                    console.error("Supabase Insert Error:", dbError);
                    return [2 /*return*/, res.status(500).json({ error: "Failed to queue execution." })];
                }
                jobId_1 = insertData.id;
                res.json({ job_id: jobId_1, status: 'queued' }); // Immediate response
                // 2. Trigger Background Submission
                (function () { return __awaiter(void 0, void 0, void 0, function () {
                    var savedFile, wrappedCode, judge0Id, payload, _a, token, employedUrl, bgError_1;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                _b.trys.push([0, 5, , 7]);
                                savedFile = null;
                                if (!isSubmission) return [3 /*break*/, 2];
                                return [4 /*yield*/, saveToBucket(teamName || "anonymous", problemId || "two-sum", language, code)];
                            case 1:
                                savedFile = _b.sent();
                                _b.label = 2;
                            case 2:
                                wrappedCode = wrapCode(code, language, problem);
                                judge0Id = JUDGE0_LANG_IDS[language];
                                if (!judge0Id)
                                    throw new Error("Unsupported Language");
                                payload = {
                                    source_code: Buffer.from(wrappedCode).toString('base64'),
                                    language_id: judge0Id,
                                    stdin: Buffer.from("").toString('base64'),
                                    callback_url: "".concat(process.env.PUBLIC_API_URL || 'http://localhost:3001', "/api/callback") // Optional: if we want webhook
                                };
                                return [4 /*yield*/, submitWithFallback(payload)];
                            case 3:
                                _a = _b.sent(), token = _a.token, employedUrl = _a.url;
                                // Update DB with Token and set status to 'running'
                                return [4 /*yield*/, supabase
                                        .from('executions')
                                        .update({
                                        status: 'running',
                                        metadata: { judge0_token: token, judge0_url: employedUrl, problem_id: problemId, saved_file: savedFile }
                                    })
                                        .eq('id', jobId_1)];
                            case 4:
                                // Update DB with Token and set status to 'running'
                                _b.sent();
                                return [3 /*break*/, 7];
                            case 5:
                                bgError_1 = _b.sent();
                                console.error("[BACKGROUND] Job ".concat(jobId_1, " Failed:"), bgError_1);
                                return [4 /*yield*/, supabase
                                        .from('executions')
                                        .update({ status: 'error', stderr: bgError_1.message })
                                        .eq('id', jobId_1)];
                            case 6:
                                _b.sent();
                                return [3 /*break*/, 7];
                            case 7: return [2 /*return*/];
                        }
                    });
                }); })();
                return [3 /*break*/, 4];
            case 3:
                e_2 = _c.sent();
                console.error("Judge0 Error:", e_2);
                res.status(500).json({ status: 'Error', output: "Judge0 Connection Failed: ".concat(e_2.message, ". Is Judge0 running on port 2358?"), results: [] });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.listen(PORT, function () {
    console.log("Server running on http://localhost:".concat(PORT));
    console.log("Using Judge0 URLs: ".concat(JUDGE0_URLS.join(', ')));
});
app.get('/healthcheck', function (req, res) {
    res.status(200).json({ status: 'ok', judge0_urls: JUDGE0_URLS });
});
// LEADERBOARD ENDPOINT
app.get('/api/leaderboard', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, data, error, e_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                return [4 /*yield*/, supabase
                        .from('executions')
                        .select('*')
                        .order('created_at', { ascending: false })];
            case 1:
                _a = _b.sent(), data = _a.data, error = _a.error;
                if (error)
                    throw error;
                res.json(data);
                return [3 /*break*/, 3];
            case 2:
                e_3 = _b.sent();
                res.status(500).json({ error: e_3.message });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// STATUS ENDPOINT
app.get('/api/status/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, _a, data, error;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                id = req.params.id;
                return [4 /*yield*/, supabase.from('executions').select('*').eq('id', id).single()];
            case 1:
                _a = _b.sent(), data = _a.data, error = _a.error;
                if (error || !data)
                    return [2 /*return*/, res.status(404).json({ error: 'Job not found' })];
                res.json(data);
                return [2 /*return*/];
        }
    });
}); });
// POLLING WORKER
setInterval(function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, jobs, error, _loop_2, _i, jobs_1, job;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, supabase
                    .from('executions')
                    .select('*')
                    .eq('status', 'running')
                    .not('metadata', 'is', null) // Ensure metadata exists
                    .limit(10)];
            case 1:
                _a = _b.sent(), jobs = _a.data, error = _a.error;
                if (error || !jobs || jobs.length === 0)
                    return [2 /*return*/];
                _loop_2 = function (job) {
                    var _c, judge0_token, judge0_url, problem_id, saved_file, response, data, finalStatus, output, score, stderr, stdoutRaw, problem, passedCount_1, judgeLines_1, existing, r1, r2, newOverall, e_4;
                    return __generator(this, function (_d) {
                        switch (_d.label) {
                            case 0:
                                _d.trys.push([0, 7, , 8]);
                                _c = job.metadata, judge0_token = _c.judge0_token, judge0_url = _c.judge0_url, problem_id = _c.problem_id, saved_file = _c.saved_file;
                                if (!judge0_token)
                                    return [2 /*return*/, "continue"];
                                return [4 /*yield*/, fetch("".concat(judge0_url, "/submissions/").concat(judge0_token, "?base64_encoded=true"), {
                                        signal: AbortSignal.timeout(5000)
                                    })];
                            case 1:
                                response = _d.sent();
                                if (!response.ok)
                                    return [2 /*return*/, "continue"];
                                return [4 /*yield*/, response.json()];
                            case 2:
                                data = _d.sent();
                                // Check Status
                                // 1: In Queue, 2: Processing, 3: Accepted, 4-14: Errors/Wrong Answer
                                if (data.status.id <= 2) {
                                    return [2 /*return*/, "continue"];
                                }
                                // Finished! Process Result
                                console.log("[POLL] Job ".concat(job.id, " finished with status ").concat(data.status.description));
                                finalStatus = 'error';
                                output = '';
                                score = 0;
                                stderr = '';
                                if (data.status.id === 6) { // Compilation Error
                                    output = Buffer.from(data.compile_output || "", 'base64').toString('utf-8');
                                    finalStatus = 'error';
                                }
                                else if (data.status.id > 2) {
                                    stdoutRaw = data.stdout ? Buffer.from(data.stdout, 'base64').toString('utf-8') : "";
                                    stderr = data.stderr ? Buffer.from(data.stderr, 'base64').toString('utf-8') : "";
                                    problem = PROBLEMS[problem_id] || PROBLEMS['two-sum'];
                                    passedCount_1 = 0;
                                    judgeLines_1 = stdoutRaw.split('\n').filter(function (l) { return l.startsWith('__JUDGE__ '); });
                                    // We need to reconstruct the "results" array to store in DB or just store the score/output
                                    // Connect.md says: "Compute score, Update Supabase"
                                    problem.testCases.forEach(function (tc, index) {
                                        var searchStr = "__JUDGE__ Test Case ".concat(index + 1, ": ");
                                        var line = judgeLines_1.find(function (l) { return l.includes(searchStr); });
                                        if (line) {
                                            var actual = line.replace(searchStr, '').trim();
                                            var normalize = function (s) { return s.replace(/\s+/g, ''); };
                                            if (normalize(actual) === normalize(tc.expected))
                                                passedCount_1++;
                                        }
                                    });
                                    score = parseFloat(((passedCount_1 / problem.testCases.length) * 100).toFixed(2));
                                    output = stdoutRaw; // Store full output or just user logs? Storing full for now.
                                    finalStatus = 'completed'; // or 'success'
                                }
                                // Update Supabase
                                return [4 /*yield*/, supabase
                                        .from('executions')
                                        .update({
                                        status: finalStatus,
                                        stdout: output,
                                        stderr: stderr,
                                        score: score,
                                        // Can store structured results in a JSON column if schema has it, else just text
                                    })
                                        .eq('id', job.id)];
                            case 3:
                                // Update Supabase
                                _d.sent();
                                if (!(job.user_id && job.user_id !== 'anonymous')) return [3 /*break*/, 6];
                                return [4 /*yield*/, supabase.from('leaderboard').select('*').eq('user_id', job.user_id).single()];
                            case 4:
                                existing = (_d.sent()).data;
                                r1 = (existing === null || existing === void 0 ? void 0 : existing.round1_score) || 0;
                                r2 = (existing === null || existing === void 0 ? void 0 : existing.round2_score) || 0;
                                newOverall = r1 + r2 + score;
                                return [4 /*yield*/, supabase.from('leaderboard').upsert({
                                        user_id: job.user_id,
                                        round3_score: score,
                                        overall_score: newOverall,
                                        updated_at: new Date().toISOString()
                                    }, { onConflict: 'user_id' })];
                            case 5:
                                _d.sent();
                                _d.label = 6;
                            case 6: return [3 /*break*/, 8];
                            case 7:
                                e_4 = _d.sent();
                                console.error("[POLL] Error processing job ".concat(job.id, ":"), e_4);
                                return [3 /*break*/, 8];
                            case 8: return [2 /*return*/];
                        }
                    });
                };
                _i = 0, jobs_1 = jobs;
                _b.label = 2;
            case 2:
                if (!(_i < jobs_1.length)) return [3 /*break*/, 5];
                job = jobs_1[_i];
                return [5 /*yield**/, _loop_2(job)];
            case 3:
                _b.sent();
                _b.label = 4;
            case 4:
                _i++;
                return [3 /*break*/, 2];
            case 5: return [2 /*return*/];
        }
    });
}); }, 2000); // Poll every 2s
