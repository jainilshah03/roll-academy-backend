import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 🔁 OLD → NEW PUBLIC R2 URL
const OLD_R2_PREFIX =
  "https://rollacademy.3a87b5af401e08ae7cad817bb3f6a5d1.r2.cloudflarestorage.com";

const NEW_R2_PREFIX =
  "https://pub-ac5b54742fd140199aadc2730cb8f988.r2.dev";

async function main() {
  console.log("🔍 Fetching videos from DB...");

  const videos = await prisma.video.findMany();

  console.log(`📦 Found ${videos.length} videos`);

  for (const video of videos) {
    let changed = false;

    /* ================= FIX SINGLE URL ================= */
    let newUrl = video.url;
    if (newUrl && newUrl.startsWith(OLD_R2_PREFIX)) {
      newUrl = newUrl.replace(OLD_R2_PREFIX, NEW_R2_PREFIX);
      changed = true;
    }

    /* ================= FIX ANGLES ================= */
    let newAngles: Record<string, string> | null = null;

    if (video.angles && typeof video.angles === "object") {
      newAngles = {};

      for (const [key, value] of Object.entries(
        video.angles as Record<string, string>
      )) {
        if (value.startsWith(OLD_R2_PREFIX)) {
          newAngles[key] = value.replace(
            OLD_R2_PREFIX,
            NEW_R2_PREFIX
          );
          changed = true;
        } else {
          newAngles[key] = value;
        }
      }
    }

    /* ================= UPDATE IF NEEDED ================= */
    if (changed) {
      await prisma.video.update({
        where: { id: video.id },
        data: {
          url: newUrl ?? undefined,
          angles: newAngles as any, // ✅ correct Prisma JSON handling
        },
      });

      console.log(`✅ Fixed video: ${video.title}`);
    }
  }

  console.log("🎉 All R2 URLs fixed successfully");
}

main()
  .catch((e) => {
    console.error("❌ Error fixing URLs:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
