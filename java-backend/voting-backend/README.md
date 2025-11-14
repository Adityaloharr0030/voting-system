# Voting Backend — Java 21 upgrade helper

This service has been updated to target Java 21. The POM now sets `<java.version>` to `21` and the Maven Compiler Plugin uses `<release>21`.

What changed
- `pom.xml`: java.version changed to `21` and `maven-compiler-plugin` added with `<release>21`.

Pre-requisites to build locally
- Java 21 (JDK) installed and active in your shell
- Maven installed (or the Maven Wrapper `mvnw` present — not yet added to the repo)

Quick setup (Windows)
1. If you have Chocolatey installed, you can run the helper script located at `scripts\setup-windows.ps1` as Administrator. It will install Temurin JDK 21 and Maven.

   Open PowerShell as Administrator and run:

   powershell
   Set-ExecutionPolicy Bypass -Scope Process -Force
   .\scripts\setup-windows.ps1

2. If you don't use Chocolatey, install a JDK 21 distribution (Eclipse Temurin / Microsoft Build of OpenJDK) and Maven manually, then set `JAVA_HOME` to the JDK 21 installation and make sure `%JAVA_HOME%\bin` and Maven's `bin` are on your `PATH`.

Verify your environment

```powershell
java -version   # should show Java 21
mvn -v          # should show Maven version
```

Build the project

```powershell
cd voting-backend
mvn -DskipTests package
```

If you'd like, I can also:
- Add a Maven Wrapper (`mvnw`) so other contributors can build without installing Maven system-wide (I can create it once Maven is available in this environment or you run the wrapper generation locally).
- Bump Spring Boot to a Java-21-ready release (I can propose a version and test the build once JDK21 + Maven are available).

If you run into build errors after installing Java 21 and Maven, paste the build output here and I'll fix the issues.
