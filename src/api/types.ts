export interface LoginResponse {
  success: boolean;
  token: string;
  refreshToken: string;
}

export interface TestStep {
  id?: number;
  testcase_id?: number;
  value: string;
}

export interface TestCase {
  id?: number;
  candidate_id?: number;
  title: string;
  expected_result: string;
  description: string;
  automated: boolean;
  candidate_scenario_id?: number;
  test_steps: TestStep[];
}
