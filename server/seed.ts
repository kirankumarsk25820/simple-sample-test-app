import { db } from "./db";
import {
  students,
  mcqQuestions,
  codingProblems,
  admins,
  type InsertMCQQuestion,
  type InsertCodingProblem,
  type InsertAdmin,
} from "@shared/schema";

export async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");

    // Seed MCQ Questions
    const sampleMCQs: InsertMCQQuestion[] = [
      {
        question: "What is the time complexity of binary search?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        correctAnswer: "O(log n)",
        category: "Algorithms",
        difficulty: "Medium"
      },
      {
        question: "Which data structure uses LIFO principle?",
        options: ["Queue", "Stack", "Array", "Linked List"],
        correctAnswer: "Stack",
        category: "Data Structures",
        difficulty: "Easy"
      },
      {
        question: "What is the worst-case time complexity of QuickSort?",
        options: ["O(n log n)", "O(n²)", "O(n)", "O(log n)"],
        correctAnswer: "O(n²)",
        category: "Algorithms",
        difficulty: "Medium"
      },
      {
        question: "Which of the following is NOT a principle of Object-Oriented Programming?",
        options: ["Encapsulation", "Inheritance", "Polymorphism", "Compilation"],
        correctAnswer: "Compilation",
        category: "Object-Oriented Programming",
        difficulty: "Easy"
      },
      {
        question: "In which data structure is FIFO principle used?",
        options: ["Stack", "Queue", "Binary Tree", "Hash Table"],
        correctAnswer: "Queue",
        category: "Data Structures",
        difficulty: "Easy"
      }
    ];

    console.log("📝 Seeding MCQ questions...");
    for (const mcq of sampleMCQs) {
      try {
        await db.insert(mcqQuestions).values(mcq);
      } catch (error) {
        // Ignore duplicate key errors
        if (!error.message?.includes('duplicate key')) {
          throw error;
        }
      }
    }

    // Seed Coding Problems
    const sampleProblems: InsertCodingProblem[] = [
      {
        title: "Two Sum",
        description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
        difficulty: "Easy",
        tags: ["Array", "Hash Table"],
        testCases: [
          {
            input: { nums: [2, 7, 11, 15], target: 9 },
            output: [0, 1]
          },
          {
            input: { nums: [3, 2, 4], target: 6 },
            output: [1, 2]
          },
          {
            input: { nums: [3, 3], target: 6 },
            output: [0, 1]
          }
        ],
        templateCode: {
          python: "def two_sum(nums, target):\n    # Write your solution here\n    pass",
          java: "public int[] twoSum(int[] nums, int target) {\n    // Write your solution here\n    return new int[0];\n}",
          cpp: "vector<int> twoSum(vector<int>& nums, int target) {\n    // Write your solution here\n    return {};\n}",
          c: "int* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    // Write your solution here\n    *returnSize = 0;\n    return NULL;\n}",
          javascript: "function twoSum(nums, target) {\n    // Write your solution here\n}"
        },
        constraints: "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists."
      },
      {
        title: "Palindrome Number",
        description: "Given an integer x, return true if x is palindrome integer.\n\nAn integer is a palindrome when it reads the same backward as forward.\n\nFor example, 121 is a palindrome while 123 is not.",
        difficulty: "Easy",
        tags: ["Math"],
        testCases: [
          {
            input: { x: 121 },
            output: true
          },
          {
            input: { x: -121 },
            output: false
          },
          {
            input: { x: 10 },
            output: false
          }
        ],
        templateCode: {
          python: "def is_palindrome(x):\n    # Write your solution here\n    pass",
          java: "public boolean isPalindrome(int x) {\n    // Write your solution here\n    return false;\n}",
          cpp: "bool isPalindrome(int x) {\n    // Write your solution here\n    return false;\n}",
          c: "bool isPalindrome(int x) {\n    // Write your solution here\n    return false;\n}",
          javascript: "function isPalindrome(x) {\n    // Write your solution here\n}"
        },
        constraints: "-2^31 <= x <= 2^31 - 1"
      }
    ];

    console.log("💻 Seeding coding problems...");
    for (const problem of sampleProblems) {
      try {
        await db.insert(codingProblems).values(problem);
      } catch (error) {
        // Ignore duplicate key errors
        if (!error.message?.includes('duplicate key')) {
          throw error;
        }
      }
    }

    // Seed admin user
    const adminUser: InsertAdmin = {
      email: "admin@codeassess.com",
      password: "admin123", // In production, this should be hashed
      name: "Administrator"
    };

    console.log("👨‍💼 Seeding admin user...");
    try {
      await db.insert(admins).values(adminUser);
    } catch (error) {
      // Ignore duplicate key errors
      if (!error.message?.includes('duplicate key')) {
        throw error;
      }
    }

    console.log("✅ Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log("🎉 Seeding process finished!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Seeding failed:", error);
      process.exit(1);
    });
}