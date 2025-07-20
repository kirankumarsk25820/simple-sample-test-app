import { spawn } from "child_process";
import { writeFileSync, unlinkSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

export interface TestCase {
  input: any;
  output: any;
}

export interface ExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  executionTime?: number;
  testResults?: TestResult[];
}

export interface TestResult {
  passed: boolean;
  input: any;
  expectedOutput: any;
  actualOutput?: any;
  error?: string;
}

const TIMEOUT_MS = 10000; // 10 seconds

export class CodeExecutionService {
  private tempDir: string;

  constructor() {
    this.tempDir = join(tmpdir(), 'codeassess');
    if (!existsSync(this.tempDir)) {
      mkdirSync(this.tempDir, { recursive: true });
    }
  }

  async executeCode(
    code: string,
    language: string,
    testCases: TestCase[]
  ): Promise<ExecutionResult> {
    try {
      const startTime = Date.now();
      const testResults: TestResult[] = [];

      for (const testCase of testCases) {
        const result = await this.runSingleTest(code, language, testCase);
        testResults.push(result);
      }

      const executionTime = Date.now() - startTime;
      const allPassed = testResults.every(result => result.passed);

      return {
        success: allPassed,
        executionTime,
        testResults
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown execution error'
      };
    }
  }

  private async runSingleTest(
    code: string,
    language: string,
    testCase: TestCase
  ): Promise<TestResult> {
    const fileName = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const filePath = join(this.tempDir, fileName);

    try {
      // Prepare code with test case input
      const executableCode = this.prepareCode(code, language, testCase.input);
      const fullPath = this.writeCodeToFile(executableCode, language, filePath);

      // Execute the code
      const output = await this.runCode(fullPath, language);
      
      // Clean up
      this.cleanup(fullPath, language);

      // Compare output
      const actualOutput = this.parseOutput(output, language);
      const passed = this.compareOutputs(actualOutput, testCase.output);

      return {
        passed,
        input: testCase.input,
        expectedOutput: testCase.output,
        actualOutput
      };
    } catch (error) {
      this.cleanup(filePath, language);
      return {
        passed: false,
        input: testCase.input,
        expectedOutput: testCase.output,
        error: error instanceof Error ? error.message : 'Execution error'
      };
    }
  }

  private prepareCode(code: string, language: string, input: any): string {
    switch (language) {
      case 'python':
        return `${code}\n\n# Test execution\nif __name__ == "__main__":\n    result = two_sum(${JSON.stringify(input.nums)}, ${input.target})\n    print(result)`;
      
      case 'javascript':
        return `${code}\n\n// Test execution\nconst result = twoSum(${JSON.stringify(input.nums)}, ${input.target});\nconsole.log(JSON.stringify(result));`;
      
      case 'java':
        return `
import java.util.*;
public class Solution {
    ${code}
    
    public static void main(String[] args) {
        Solution sol = new Solution();
        int[] nums = {${input.nums.join(', ')}};
        int target = ${input.target};
        int[] result = sol.twoSum(nums, target);
        System.out.println(Arrays.toString(result));
    }
}`;
      
      case 'cpp':
        return `
#include <iostream>
#include <vector>
using namespace std;

${code}

int main() {
    vector<int> nums = {${input.nums.join(', ')}};
    int target = ${input.target};
    vector<int> result = twoSum(nums, target);
    cout << "[";
    for (int i = 0; i < result.size(); i++) {
        cout << result[i];
        if (i < result.size() - 1) cout << ", ";
    }
    cout << "]" << endl;
    return 0;
}`;
      
      case 'c':
        return `
#include <stdio.h>
#include <stdlib.h>

${code}

int main() {
    int nums[] = {${input.nums.join(', ')}};
    int target = ${input.target};
    int returnSize;
    int* result = twoSum(nums, ${input.nums.length}, target, &returnSize);
    printf("[");
    for (int i = 0; i < returnSize; i++) {
        printf("%d", result[i]);
        if (i < returnSize - 1) printf(", ");
    }
    printf("]\\n");
    free(result);
    return 0;
}`;
      
      default:
        throw new Error(`Unsupported language: ${language}`);
    }
  }

  private writeCodeToFile(code: string, language: string, basePath: string): string {
    const extensions = {
      python: '.py',
      javascript: '.js',
      java: '.java',
      cpp: '.cpp',
      c: '.c'
    };

    const fullPath = basePath + extensions[language as keyof typeof extensions];
    writeFileSync(fullPath, code);
    return fullPath;
  }

  private async runCode(filePath: string, language: string): Promise<string> {
    return new Promise((resolve, reject) => {
      let command: string;
      let args: string[];

      switch (language) {
        case 'python':
          command = 'python3';
          args = [filePath];
          break;
        case 'javascript':
          command = 'node';
          args = [filePath];
          break;
        case 'java':
          // Compile first
          const javaDir = filePath.substring(0, filePath.lastIndexOf('/'));
          const compileProcess = spawn('javac', [filePath], { cwd: javaDir });
          compileProcess.on('close', (code) => {
            if (code !== 0) {
              reject(new Error('Compilation failed'));
              return;
            }
            // Run compiled Java
            command = 'java';
            args = ['Solution'];
            this.executeCommand(command, args, javaDir, resolve, reject);
          });
          return;
        case 'cpp':
          // Compile first
          const cppDir = filePath.substring(0, filePath.lastIndexOf('/'));
          const cppExe = filePath.replace('.cpp', '');
          const cppCompileProcess = spawn('g++', [filePath, '-o', cppExe]);
          cppCompileProcess.on('close', (code) => {
            if (code !== 0) {
              reject(new Error('Compilation failed'));
              return;
            }
            // Run compiled C++
            this.executeCommand(cppExe, [], cppDir, resolve, reject);
          });
          return;
        case 'c':
          // Compile first
          const cDir = filePath.substring(0, filePath.lastIndexOf('/'));
          const cExe = filePath.replace('.c', '');
          const cCompileProcess = spawn('gcc', [filePath, '-o', cExe]);
          cCompileProcess.on('close', (code) => {
            if (code !== 0) {
              reject(new Error('Compilation failed'));
              return;
            }
            // Run compiled C
            this.executeCommand(cExe, [], cDir, resolve, reject);
          });
          return;
        default:
          reject(new Error(`Unsupported language: ${language}`));
          return;
      }

      this.executeCommand(command, args, undefined, resolve, reject);
    });
  }

  private executeCommand(
    command: string,
    args: string[],
    cwd: string | undefined,
    resolve: (value: string) => void,
    reject: (reason: any) => void
  ) {
    const process = spawn(command, args, { cwd });
    let output = '';
    let error = '';

    const timer = setTimeout(() => {
      process.kill();
      reject(new Error('Execution timeout'));
    }, TIMEOUT_MS);

    process.stdout.on('data', (data) => {
      output += data.toString();
    });

    process.stderr.on('data', (data) => {
      error += data.toString();
    });

    process.on('close', (code) => {
      clearTimeout(timer);
      if (code !== 0) {
        reject(new Error(error || 'Process exited with non-zero code'));
      } else {
        resolve(output.trim());
      }
    });
  }

  private parseOutput(output: string, language: string): any {
    try {
      if (language === 'javascript') {
        return JSON.parse(output);
      } else if (language === 'python') {
        return JSON.parse(output.replace(/'/g, '"'));
      } else {
        // For Java, C++, C - parse array format like [0, 1]
        const cleaned = output.replace(/[\[\]]/g, '');
        if (cleaned.trim() === '') return [];
        return cleaned.split(',').map(x => parseInt(x.trim()));
      }
    } catch {
      return output;
    }
  }

  private compareOutputs(actual: any, expected: any): boolean {
    if (Array.isArray(actual) && Array.isArray(expected)) {
      if (actual.length !== expected.length) return false;
      return actual.every((val, index) => val === expected[index]);
    }
    return actual === expected;
  }

  private cleanup(filePath: string, language: string) {
    try {
      unlinkSync(filePath);
      
      // Clean up compiled files
      if (language === 'java') {
        const classFile = filePath.replace('.java', '.class');
        if (existsSync(classFile)) unlinkSync(classFile);
      } else if (language === 'cpp') {
        const exeFile = filePath.replace('.cpp', '');
        if (existsSync(exeFile)) unlinkSync(exeFile);
      } else if (language === 'c') {
        const exeFile = filePath.replace('.c', '');
        if (existsSync(exeFile)) unlinkSync(exeFile);
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  }
}

export const codeExecutionService = new CodeExecutionService();
