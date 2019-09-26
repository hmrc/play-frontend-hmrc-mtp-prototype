#!/bin/bash

echo ""
echo "Applying migration Name"

echo "Adding routes to conf/app.routes"

echo "" >> ../conf/app.routes
echo "GET        /name                        controllers.NameController.onPageLoad(mode: Mode = NormalMode)" >> ../conf/app.routes
echo "POST       /name                        controllers.NameController.onSubmit(mode: Mode = NormalMode)" >> ../conf/app.routes

echo "GET        /changeName                  controllers.NameController.onPageLoad(mode: Mode = CheckMode)" >> ../conf/app.routes
echo "POST       /changeName                  controllers.NameController.onSubmit(mode: Mode = CheckMode)" >> ../conf/app.routes

echo "Adding messages to conf.messages"
echo "" >> ../conf/messages.en
echo "name.title = name" >> ../conf/messages.en
echo "name.heading = name" >> ../conf/messages.en
echo "name.checkYourAnswersLabel = name" >> ../conf/messages.en
echo "name.error.required = Enter name" >> ../conf/messages.en
echo "name.error.length = Name must be 100 characters or less" >> ../conf/messages.en

echo "Adding to UserAnswersEntryGenerators"
awk '/trait UserAnswersEntryGenerators/ {\
    print;\
    print "";\
    print "  implicit lazy val arbitraryNameUserAnswersEntry: Arbitrary[(NamePage.type, JsValue)] =";\
    print "    Arbitrary {";\
    print "      for {";\
    print "        page  <- arbitrary[NamePage.type]";\
    print "        value <- arbitrary[String].suchThat(_.nonEmpty).map(Json.toJson(_))";\
    print "      } yield (page, value)";\
    print "    }";\
    next }1' ../test/generators/UserAnswersEntryGenerators.scala > tmp && mv tmp ../test/generators/UserAnswersEntryGenerators.scala

echo "Adding to PageGenerators"
awk '/trait PageGenerators/ {\
    print;\
    print "";\
    print "  implicit lazy val arbitraryNamePage: Arbitrary[NamePage.type] =";\
    print "    Arbitrary(NamePage)";\
    next }1' ../test/generators/PageGenerators.scala > tmp && mv tmp ../test/generators/PageGenerators.scala

echo "Adding to UserAnswersGenerator"
awk '/val generators/ {\
    print;\
    print "    arbitrary[(NamePage.type, JsValue)] ::";\
    next }1' ../test/generators/UserAnswersGenerator.scala > tmp && mv tmp ../test/generators/UserAnswersGenerator.scala

echo "Adding helper method to CheckYourAnswersHelper"
awk '/class/ {\
     print;\
     print "";\
     print "  def name: Option[AnswerRow] = userAnswers.get(NamePage) map {";\
     print "    x =>";\
     print "      AnswerRow(";\
     print "        HtmlFormat.escape(messages(\"name.checkYourAnswersLabel\")),";\
     print "        HtmlFormat.escape(x),";\
     print "        routes.NameController.onPageLoad(CheckMode).url";\
     print "      )"
     print "  }";\
     next }1' ../app/utils/CheckYourAnswersHelper.scala > tmp && mv tmp ../app/utils/CheckYourAnswersHelper.scala

echo "Migration Name completed"
