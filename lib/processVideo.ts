import { exec } from "child_process";
import util from "util";

const execAsync = util.promisify(exec);

export async function processVideo(input: string, output: string) {
  const cmd = `
ffmpeg -y -i "${input}" \
-c:v libx264 \
-pix_fmt yuv420p \
-profile:v main \
-level 4.0 \
-g 48 \
-keyint_min 48 \
-sc_threshold 0 \
-movflags +faststart \
-c:a aac \
-b:a 128k \
"${output}"
`;
  await execAsync(cmd);
}
