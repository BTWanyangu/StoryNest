import { BookOpen, Quote, Star } from "lucide-react";

const reviews = [
  {
    id: 1,
    name: "Sarah M.",
    role: "Parent of two",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
    text: `"StoryNestAI has transformed our bedtime routine! My kids are so excited to create their own stories, and I love how it adapts to their reading levels. The AI-generated content is incredibly engaging and educational."`,
  },
  {
    id: 2,
    name: "David L.",
    role: "Elementary Teacher",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    text: `"As an educator, I'm amazed by how StoryNestAI combines creativity with learning. The AI-generated stories are not only entertaining but also help develop critical thinking and reading comprehension skills."`,
  },
  {
    id: 3,
    name: "Emily R.",
    role: "Mom of three",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=80",
    text: `"The personalization features are incredible! Each of my children has their own unique reading journey, and they love being able to influence their stories. The audio narration and images make it even more immersive."`,
  },
];

export default function Review() {
  return (
    <section className="w-full  px-4 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-2 text-sm font-medium text-violet-600">
            <Star className="h-4 w-4" />
            Trusted by Thousands of Families
          </div>

          <h2 className="mt-8 text-4xl font-bold leading-tight text-moon md:text-6xl">
            Stories from Our
          </h2>

          <h3 className="mt-2 text-4xl font-bold leading-tight bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent md:text-6xl">
            Happy Readers
          </h3>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-500 md:text-xl">
            Join thousands of satisfied families who are making reading an
            exciting adventure with StoryNestAI.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-3xl border border-violet-100 bg-white p-7 shadow-[0_14px_30px_rgba(139,92,246,0.10)]"
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-1 text-yellow-400">
                  {[...Array(5)].map((_, index) => (
                    <Star
                      key={index}
                      className="h-5 w-5 fill-current"
                      strokeWidth={1.5}
                    />
                  ))}
                </div>

                <Quote className="h-8 w-8 text-violet-200" />
              </div>

              <p className="mt-6 text-lg leading-9 text-slate-600">
                {review.text}
              </p>

              <div className="mt-8 flex items-center gap-4">
                <img
                  src={review.image}
                  alt={review.name}
                  className="h-14 w-14 rounded-full object-cover"
                />

                <div>
                  <h4 className="text-lg font-semibold text-slate-900">
                    {review.name}
                  </h4>
                  <p className="text-sm text-slate-500">{review.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-center gap-8 text-slate-600">
          <div className="flex items-center gap-2 text-base md:text-lg">
            <BookOpen className="h-5 w-5 text-violet-600" />
            <span>2,000+ Stories Generated</span>
          </div>

          <div className="flex items-center gap-2 text-base md:text-lg">
            <Quote className="h-5 w-5 text-violet-600" />
            <span>100+ Happy Families</span>
          </div>
        </div>
      </div>
    </section>
  );
}