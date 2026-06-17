// Custom Studio structure — three groups, exactly as requested:
//   1. General site settings (a single settings document)
//   2. Pages (one editable singleton per page: Home / About / Work / Contact)
//   3. Projects (a list — each item is one project)
//
// Because we provide a custom structure, the default auto-generated document
// lists are replaced, so singletons appear only here (and the config strips
// their create/delete actions).
const PAGE_SINGLETONS = [
  { id: 'homePage', title: 'Home' },
  { id: 'aboutPage', title: 'About' },
  { id: 'workPage', title: 'Work' },
  { id: 'contactPage', title: 'Contact' },
]

export const structure = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('General site settings')
        .id('siteSettings')
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId('siteSettings')
            .title('General site settings'),
        ),

      S.divider(),

      S.listItem()
        .title('Pages')
        .id('pages')
        .child(
          S.list()
            .title('Pages')
            .items(
              PAGE_SINGLETONS.map((p) =>
                S.listItem()
                  .title(p.title)
                  .id(p.id)
                  .child(S.document().schemaType(p.id).documentId(p.id).title(p.title)),
              ),
            ),
        ),

      S.divider(),

      S.listItem()
        .title('Projects')
        .id('projects')
        .child(S.documentTypeList('project').title('Projects')),
    ])
